import { getTotp } from "minimal-cognito-totp";

import { srpLogin, refresh, TAuthStep } from "../";

import { poolSetups, TEMP_PASSWORD } from "./poolSetups";
import { getConfigByName } from "./poolHelper";
import { getUserByPool } from "./userHelper";

type TDeviceInfo = {
  key: string;
  groupKey: string;
  password?: string;
  deviceAutoConfirmed: boolean;
  userAutoConfirmed?: boolean;
  userConfirmationNecessary?: boolean;
};

const expectResult = (step: TAuthStep, code: string) => {
  if (step.code !== code) {
    console.warn("unexpected result", JSON.stringify(step));
    if (step.error) {
      console.warn(step.error);
      try {
        console.warn(JSON.stringify(step.error, null, 2));
      } catch {
        // pass
      }
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

/*
const filteredSetups = poolSetups.filter(
  (ps) => ps.hints.includes("RESET_PW_NEEDED") // && ps.hints.includes("MFA_ENABLED")
);
*/

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

      let autoRememberDevice = null;

      if (!setup.hints.includes("SKIP_REMEMBER_DEVICE")) {
        if (setup.hints.includes("DONT_REMEMBER_DEVICE")) {
          autoRememberDevice = "not_remembered" as const;
        } else {
          autoRememberDevice = "remembered" as const;
        }
      }

      const login = srpLogin({
        region,
        clientId,
        userPoolId: poolId,
        username: username,
        password: setup.hints.includes("RESET_PW_NEEDED")
          ? TEMP_PASSWORD
          : password,
        device: undefined,
        autoConfirmDevice: true,
        autoRememberDevice,
        debugTracing: false,
      });

      let response = await login.next();

      if (setup.hints.includes("RESET_PW_NEEDED")) {
        expectResult(response.value, "NEW_PASSWORD_REQUIRED");
        response = await login.next(password);
      }

      if (setup.hints.includes("MFA_ENABLED")) {
        expectResult(response.value, "SOFTWARE_MFA_REQUIRED");
        expect(response.done).toEqual(false);

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

      if (setup.hints.includes("TEST_DEVICES")) {
        expect(authResult.newDevice).toBeDefined();
        expect(authResult.newDevice!.key).toBeDefined();
        expect(authResult.newDevice!.groupKey).toBeDefined();
        expect(authResult.newDevice!.password).toBeDefined();
        expect(authResult.newDevice!.deviceAutoConfirmed).toBe(true);

        if (setup.hints.includes("DEVICES_OPTIONAL")) {
          if (setup.hints.includes("SKIP_REMEMBER_DEVICE")) {
            expect(authResult.newDevice!.userConfirmationNecessary).toBe(true);
            expect(authResult.newDevice!.deviceAutoRemembered).toBeUndefined();
          } else if (setup.hints.includes("DONT_REMEMBER_DEVICE")) {
            expect(authResult.newDevice!.userConfirmationNecessary).toBe(false);
            expect(authResult.newDevice!.deviceAutoRemembered).toBe(
              "not_remembered"
            );
          } else {
            expect(authResult.newDevice!.userConfirmationNecessary).toBe(false);
            expect(authResult.newDevice!.deviceAutoRemembered).toBe(
              "remembered"
            );
          }
        }
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

    if (setup.hints.includes("TEST_DEVICES")) {
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
            autoRememberDevice: "remembered",
          });

          let response = await login.next();

          const skipMfaKnownDevice =
            setup.hints.includes("SKIP_MFA_REMEMBERED") &&
            !(
              setup.hints.includes("DONT_REMEMBER_DEVICE") ||
              setup.hints.includes("SKIP_REMEMBER_DEVICE")
            );

          if (!skipMfaKnownDevice && setup.hints.includes("MFA_ENABLED")) {
            expectResult(response.value, "SOFTWARE_MFA_REQUIRED");
            expect(response.done).toEqual(false);

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
    }
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
    autoRememberDevice: "remembered",
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
    autoRememberDevice: "remembered",
  });

  const result = await login.next();

  expect(result.value.code).toBe("ERROR");
  expect(result.value.error).toBeDefined();
  expect(result.value.error!.message).toMatch("Incorrect username or password");
});
