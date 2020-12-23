import { cognitoFetch } from "../cognito-fetch";
import { guardInitiateUserSrpResponse, TCallParams } from "../types";

export const initiateUserSRPAuth = async (
  { USERNAME, REGION, CLIENT_ID, DEVICE_KEY }: TCallParams,
  { SRP_A }: { SRP_A: string }
) => {
  const response = await cognitoFetch({
    operation: "InitiateAuth",
    region: REGION,
    args: {
      AuthFlow: "USER_SRP_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME,
        SRP_A,
        DEVICE_KEY,
      },
    },
  });

  if (!guardInitiateUserSrpResponse(response)) {
    throw new Error(`unexpected responseA: ${JSON.stringify(response)}`);
  }

  return response;
};
