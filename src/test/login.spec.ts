import { getTotp } from "minimal-cognito-totp";

import { srpLogin, refresh, TAuthStep } from "../";

import {
  AWS_DEFAULT_REGION,
  CLIENT_ID,
  USER_POOL_ID,
  USERNAME,
  PASSWORD,
  MFASEED,
} from "../_cognito-test-config";

import { poolSetups } from "./poolSetups";
import { getConfigByName } from "./poolHelper";
import { getUserByPool } from "./userHelper";

const userPoolParams = {
  region: AWS_DEFAULT_REGION,
  userPoolId: USER_POOL_ID,
  clientId: CLIENT_ID,
};

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

const expectResult = (step: TAuthStep, code: string) => {
  if (step.code !== code) {
    console.warn("unexpected result", JSON.stringify(step));
    if (step.error) {
      console.warn(step.error);
    }
  }
  expect(step.code).toBe(code);
};

const getConfig = (name: string) => {
  const { pool, region, client } = getConfigByName(name);
  const { username, password } = getUserByPool(name);

  expect(pool).toBeDefined();
  expect(region).toBeDefined();
  expect(client).toBeDefined();
  expect(username).toBeDefined();
  expect(password).toBeDefined();

  return { pool, region, client, username, password };
};

for (const setup of poolSetups) {
  const { pool, region, client, username, password } = getConfig(setup.name);

  it(`can login using pool ${setup.name}`, async () => {
    const poolId = `${setup.name}`;
    const login = srpLogin({
      userPoolId: pool,
      region,
      clientId: client,
      username: username,
      password: password,
      device: undefined,
      autoConfirmDevice: true,
    });

    const firstResult = await login.next();

    expect(firstResult.done).toEqual(true);

    expectResult(firstResult.value, "TOKENS");

    expect(firstResult.value.response).toBeDefined();
    const authResult = firstResult.value.response!;

    expect(authResult.tokens.accessToken).toBeDefined();
    expect(authResult.tokens.idToken).toBeDefined();
    expect(authResult.tokens.refreshToken).toBeDefined();

    // expect(authResult.newDevice).toBeDefined();
    // expect(authResult.newDevice!.password).toBeDefined();

    console.log(JSON.stringify(authResult, null, 2));
  });
}

xit("can login with MFA", async () => {
  const login = srpLogin({
    ...userPoolParams,
    username: USERNAME,
    password: PASSWORD,
    device: undefined,
    autoConfirmDevice: true,
  });

  const firstResult = await login.next();

  expect(firstResult.done).toEqual(false);
  expect(firstResult.value.code).toBe("SOFTWARE_MFA_REQUIRED");

  const secondResult = await login.next(getTotp(MFASEED)!);

  expect(secondResult.done).toEqual(true);

  expect(secondResult.value.code).toBe("TOKENS");

  expect(secondResult.value.response).toBeDefined();
  const authResult = secondResult.value.response!;

  expect(authResult.tokens.accessToken).toBeDefined();
  expect(authResult.tokens.idToken).toBeDefined();
  expect(authResult.tokens.refreshToken).toBeDefined();

  expect(authResult.newDevice).toBeDefined();
  expect(authResult.newDevice!.password).toBeDefined();

  console.log(JSON.stringify(authResult, null, 2));
});

xit("fails login with fatal error if bad username", async () => {
  const login = srpLogin({
    ...userPoolParams,
    username: "unknownuser@nowhere.com",
    password: PASSWORD,
    device: undefined,
    autoConfirmDevice: true,
  });

  const result = await login.next();

  expect(result.value.code).toBe("ERROR");
  expect(result.value.error).toBeDefined();
  expect(result.value.error!.message).toMatch("Incorrect username or password");
});

xit("fails login with fatal error if bad password", async () => {
  const login = srpLogin({
    ...userPoolParams,
    username: USERNAME,
    password: "not the password",
    device: undefined,
    autoConfirmDevice: true,
  });

  const result = await login.next();

  expect(result.value.code).toBe("ERROR");
  expect(result.value.error).toBeDefined();
  expect(result.value.error!.message).toMatch("Incorrect username or password");
});
