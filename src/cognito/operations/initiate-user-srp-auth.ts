import { SRPError, noop } from "../../util";
import { cognitoFetch } from "../cognito-fetch";
import { guardInitiateUserSrpResponse } from "../types";

type TInitiateUserSRPAuthParams = {
  region: string;
  clientId: string;
  username: string;
  deviceKey?: string;
  srpA: string;
  debug?: (trace: any) => void;
};

export const initiateUserSRPAuth = async ({
  username,
  region,
  clientId,
  deviceKey,
  srpA,
  debug = noop,
}: TInitiateUserSRPAuthParams) => {
  const response = await cognitoFetch({
    operation: "InitiateAuth",
    region,
    args: {
      AuthFlow: "USER_SRP_AUTH",
      ClientId: clientId,
      AuthParameters: {
        USERNAME: username,
        SRP_A: srpA,
        DEVICE_KEY: deviceKey,
      },
    },
    debug,
  });

  if (!guardInitiateUserSrpResponse(response)) {
    throw new SRPError(
      "Unexpected Response",
      500,
      "guardInitiateUserSrpResponse",
      { response }
    );
  }

  return response;
};
