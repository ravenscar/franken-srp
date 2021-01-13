import { cognitoFetch } from "../cognito-fetch";
import { guardInitiateUserSrpResponse, TCallParams } from "../types";

type TInitiateUserSRPAuthParams = TCallParams & { srpA: string };

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
