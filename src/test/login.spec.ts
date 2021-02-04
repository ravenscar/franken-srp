import { getTotp } from "minimal-cognito-totp";

import { srpLogin, refresh, TAuthStep } from "../";

import { poolSetups } from "./poolSetups";
import { getConfigByName } from "./poolHelper";
import { getUserByPool } from "./userHelper";

type TDeviceInfo = {
  key: string;
  groupKey: string;
  password: string;
};

const expectResult = (step: TAuthStep, code: string) => {
  if (step.code !== code) {
    console.warn("unexpected result", JSON.stringify(step));
    if (step.error) {
      console.warn(step.error);
    }
  }
  expect(step.code).toBe(code);
};

const getConfig = async (name: string) => {
  const { poolId, region, clientId } = getConfigByName(name);
  const { username, password, secretCode } = getUserByPool(name);

  expect(poolId).toBeDefined();
  expect(region).toBeDefined();
  expect(clientId).toBeDefined();
  expect(username).toBeDefined();
  expect(password).toBeDefined();

  return { poolId, region, clientId, username, password, secretCode };
};

type UnPromisify<T> = T extends Promise<infer U> ? U : T;
type TConfig = UnPromisify<ReturnType<typeof getConfig>>;

for (const setup of poolSetups) {
  describe(`using pool ${setup.name}`, () => {
    let setConfig: (config: TConfig) => void;
    let setDevice: (device?: TDeviceInfo) => void;
    let setRefreshToken: (device: string) => void;
    let totpTime = Math.floor(Date.now() / 1000 / 30);

    const configP = new Promise<TConfig>((res) => (setConfig = res));

    let deviceP = new Promise<TDeviceInfo | undefined>(
      (res) => (setDevice = res)
    );
    let refreshTokenP = new Promise<string>((res) => (setRefreshToken = res));

    beforeAll(async () => {
      setConfig(await getConfig(setup.name));
    });

    it(`can login`, async () => {
      const {
        poolId,
        region,
        clientId,
        username,
        password,
        secretCode,
      } = await configP;

      const login = srpLogin({
        region,
        clientId,
        userPoolId: poolId,
        username: username,
        password: password,
        device: undefined,
        autoConfirmDevice: true,
      });

      let response = await login.next();

      if (setup.hints.includes("MFA_ENABLED")) {
        expect(response.done).toEqual(false);
        expect(response.value.code).toBe("SOFTWARE_MFA_REQUIRED");

        expect(secretCode).toBeDefined();
        response = await login.next(getTotp(secretCode!, totpTime)!);
      }

      expect(response.done).toEqual(true);

      expectResult(response.value, "TOKENS");

      expect(response.value.response).toBeDefined();
      const authResult = response.value.response!;

      expect(authResult.tokens.accessToken).toBeDefined();
      expect(authResult.tokens.idToken).toBeDefined();
      expect(authResult.tokens.refreshToken).toBeDefined();
      setRefreshToken(authResult.tokens.refreshToken);

      setDevice(authResult.newDevice!);

      if (
        setup.hints.includes("REMEMBER_DEVICES_OPT") ||
        setup.hints.includes("REMEMBER_DEVICES_YES")
      ) {
        expect(authResult.newDevice).toBeDefined();
        expect(authResult.newDevice!.key).toBeDefined();
        expect(authResult.newDevice!.groupKey).toBeDefined();
        expect(authResult.newDevice!.password).toBeDefined();
      } else {
        expect(authResult.newDevice).toBeUndefined();
      }
    });

    it(`can refresh`, async () => {
      const { region, clientId } = await configP;

      const device = await deviceP;

      const refreshResult = await refresh({
        region,
        clientId,
        refreshToken: await refreshTokenP,
        deviceKey: device && device.key,
      });

      expect(refreshResult).toBeDefined();
      expect(refreshResult.accessToken).toBeDefined();
      expect(refreshResult.idToken).toBeDefined();
    });

    it("can reuse the device", async () => {
      const device = (await deviceP) as any;
      if (device) {
        const {
          poolId,
          region,
          clientId,
          username,
          password,
          secretCode,
        } = await configP;

        const login = srpLogin({
          region,
          clientId,
          userPoolId: poolId,
          username: username,
          password: password,
          device,
          autoConfirmDevice: true,
        });

        let response = await login.next();

        if (setup.hints.includes("MFA_ENABLED")) {
          expect(response.done).toEqual(false);
          expect(response.value.code).toBe("SOFTWARE_MFA_REQUIRED");

          expect(secretCode).toBeDefined();
          response = await login.next(getTotp(secretCode!, totpTime + 1)!);
        }

        expect(response.done).toEqual(true);

        expectResult(response.value, "TOKENS");

        expect(response.value.response).toBeDefined();
        const authResult = response.value.response!;

        expect(authResult.tokens.accessToken).toBeDefined();
        expect(authResult.tokens.idToken).toBeDefined();
        expect(authResult.tokens.refreshToken).toBeDefined();

        expect(authResult.newDevice).not.toBeDefined();
      }
    });
  });
}

it("fails login with fatal error if bad username", async () => {
  const { poolId, region, clientId, password } = await getConfig(
    poolSetups[0].name
  );

  const login = srpLogin({
    region,
    clientId,
    userPoolId: poolId,
    username: "blahblah",
    password: password,
    device: undefined,
    autoConfirmDevice: true,
  });

  const result = await login.next();

  expect(result.value.code).toBe("ERROR");
  expect(result.value.error).toBeDefined();
  expect(result.value.error!.message).toMatch("User does not exist");
});

it("fails login with fatal error if bad password", async () => {
  const { poolId, region, clientId, username } = await getConfig(
    poolSetups[0].name
  );

  const login = srpLogin({
    region,
    clientId,
    userPoolId: poolId,
    username: username,
    password: "BAD PASSWORD",
    device: undefined,
    autoConfirmDevice: true,
  });

  const result = await login.next();

  expect(result.value.code).toBe("ERROR");
  expect(result.value.error).toBeDefined();
  expect(result.value.error!.message).toMatch("Incorrect username or password");
});
