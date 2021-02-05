import { noop } from "../../util";
import { cognitoFetch } from "../cognito-fetch";

type TGetUserParams = {
  region: string;
  accessToken: string;
  debug?: (trace: any) => void;
};

export const getUser = async ({
  region,
  accessToken,
  debug = noop,
}: TGetUserParams) =>
  await cognitoFetch({
    region,
    operation: "GetUser",
    args: { AccessToken: accessToken },
    debug,
  });

// TODO: this needs a guard for the response
