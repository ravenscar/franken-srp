import { cognitoFetch } from "../cognito-fetch";

type TGetUserParams = { region: string; accessToken: string };

export const getUser = async ({ region, accessToken }: TGetUserParams) =>
  await cognitoFetch({
    region,
    operation: "GetUser",
    args: { AccessToken: accessToken },
  });
