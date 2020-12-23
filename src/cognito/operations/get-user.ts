import { cognitoFetch } from "../cognito-fetch";

export const getUser = async (region: string, accessToken: string) =>
  await cognitoFetch({
    region,
    operation: "GetUser",
    args: { AccessToken: accessToken },
  });
