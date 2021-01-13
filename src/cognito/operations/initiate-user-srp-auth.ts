import { cognitoFetch } from "../cognito-fetch";
import { guardInitiateUserSrpResponse } from "../types";

type TInitiateUserSRPAuthParams = {
  region: string;
  clientId: string;
  username: string;
  deviceKey?: string;
  srpA: string;
};

export const initiateUserSRPAuth = async ({
  username,
  region,
  clientId,
  deviceKey,
  srpA,
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
  });

  if (!guardInitiateUserSrpResponse(response)) {
    throw new Error(`unexpected responseA: ${JSON.stringify(response)}`);
  }

  return response;
};
