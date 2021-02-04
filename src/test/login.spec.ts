import { getTotp } from "minimal-cognito-totp";

import { srpLogin, refresh, TAuthStep } from "../";

import { poolSetups } from "./poolSetups";
import { getConfigByName } from "./poolHelper";
import { getUserByPool } from "./userHelper";

/*
export const callRefresh = async (refreshToken: string) => {
  const device = undefined;

  const result = (await refresh({
    region: userPoolParams.region,
    clientId: userPoolParams.clientId,
    refreshToken,
    deviceKey: device,
  })) as any;
  console.log(result.AuthenticationResult);
  if (result.AuthenticationResult) {
    const accToken = result.AuthenticationResult.AccessToken;
    if (accToken) {
      console.log();
      if (window.parent === window) {
        console.log("top level window");
        window.location.href = `/tokenInfo.html#${accToken}`;
      } else {
        console.log("sub window");
        window.parent.location.hash = accToken;
      }
    }
  }
};
*/

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

for (const setup of poolSetups) {
  it(`can login using pool ${setup.name}`, async () => {
    const {
      poolId,
      region,
      clientId,
      username,
      password,
      secretCode,
    } = await getConfig(setup.name);

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
      response = await login.next(getTotp(secretCode!)!);
    }

    expect(response.done).toEqual(true);

    expectResult(response.value, "TOKENS");

    expect(response.value.response).toBeDefined();
    const authResult = response.value.response!;

    expect(authResult.tokens.accessToken).toBeDefined();
    expect(authResult.tokens.idToken).toBeDefined();
    expect(authResult.tokens.refreshToken).toBeDefined();

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

    // expect(authResult.newDevice!.password).toBeDefined();

    console.log(JSON.stringify(authResult, null, 2));
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
