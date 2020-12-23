import { cognitoFetch } from "../cognito-fetch";
import { guardInitiateDeviceSrpResponse, TCallParams } from "../types";

type TRespondDeviceSRPAuthParams = TCallParams & { SRP_A: string };

export const respondDeviceSRPAuth = async ({
  USERNAME,
  REGION,
  CLIENT_ID,
  DEVICE_KEY,
  SRP_A,
}: TRespondDeviceSRPAuthParams) => {
  const response = await cognitoFetch({
    operation: "RespondToAuthChallenge",
    region: REGION,
    args: {
      ChallengeName: "DEVICE_SRP_AUTH",
      ClientId: CLIENT_ID,
      ChallengeResponses: {
        USERNAME,
        SRP_A,
        DEVICE_KEY,
      },
      Session: undefined,
    },
  });

  if (!guardInitiateDeviceSrpResponse(response)) {
    throw new Error(`unexpected responseA: ${JSON.stringify(response)}`);
  }

  return response;
};
