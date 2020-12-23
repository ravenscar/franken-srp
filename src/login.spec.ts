// {"ClientId":"4edcs1i66s925o7soij5ga2i0n","AuthFlow":"USER_PASSWORD_AUTH","AuthParameters":{"USERNAME":"paul.nilsson@smokeball.com","PASSWORD":"asdf1234"}

import {
  cognitoFetch,
  loginWithUsernamePassword,
  loginWithRefreshToken,
  confirmDevice,
} from "./";

export const AWS_DEFAULT_REGION = "xxxx" as const;
export const CLIENT_ID = "xxxx" as const;
export const USER_POOL_ID = "xxxx";

export const USERNAME = "xxxx" as const;
export const PASSWORD = "xxxx" as const;

const userPoolParams = {
  REGION: AWS_DEFAULT_REGION,
  USER_POOL_ID: USER_POOL_ID,
  CLIENT_ID: CLIENT_ID,
};

export const login = async (
  username: string,
  password: string,
  mfaCode?: string
) => {
  const device = undefined;
  const result = await loginWithUsernamePassword(
    userPoolParams,
    {
      username,
      password,
      mfaCode,
    },
    device
  );

  if (result?.AuthenticationResult?.NewDeviceMetadata) {
    const device = await confirmDevice(userPoolParams, {
      accessToken: result.AuthenticationResult.AccessToken,
      key: result.AuthenticationResult.NewDeviceMetadata.DeviceKey,
      groupKey: result.AuthenticationResult.NewDeviceMetadata.DeviceGroupKey,
    });
    //    storeDevice(device);
  }

  if (result?.AuthenticationResult) {
    const accToken = result.AuthenticationResult.AccessToken;
    const refToken = result.AuthenticationResult.RefreshToken;
    if (refToken) {
      await setCookie(refToken);
    }
    if (accToken) {
      window.location.href = `/tokenInfo.html#${accToken}`;
    }
  }
  console.log(result);
};

export const getUser = async (accessToken: string) => {
  const result = await cognitoFetch({
    region: userPoolParams.REGION,
    operation: "GetUser",
    args: { AccessToken: accessToken },
  });
  console.log(result);
  return JSON.stringify(result, null, 2);
};

export const setCookie = (refreshToken: string) => {
  return fetch("/local/cookieMe", {
    body: refreshToken,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((response) => response.text())
    .then((data) => console.log(`fetched ${data}`));
};

export const refresh = async (refreshToken: string) => {
  const device = undefined;

  // TODO @maddi what's up with this
  const result = (await loginWithRefreshToken(
    userPoolParams,
    { refreshToken },
    device
  )) as any;
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

it("can login", async () => {
  const x = await login(USERNAME, PASSWORD, "xxxx");
});
