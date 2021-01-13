import { cognitoFetch } from "../cognito-fetch";
import { guardInitiateDeviceSrpResponse } from "../types";

type TRespondDeviceSRPAuthParams = {
  region: string;
  clientId: string;
  username: string;
  deviceKey: string;
  srpA: string;
};

export const respondDeviceSRPAuth = async ({
  username,
  region,
  clientId,
  deviceKey,
  srpA,
}: TRespondDeviceSRPAuthParams) => {
  const response = await cognitoFetch({
    operation: "RespondToAuthChallenge",
    region: region,
    args: {
      ChallengeName: "DEVICE_SRP_AUTH",
      ClientId: clientId,
      ChallengeResponses: {
        USERNAME: username,
        SRP_A: srpA,
        DEVICE_KEY: deviceKey,
      },
      Session: undefined,
    },
  });

  if (!guardInitiateDeviceSrpResponse(response)) {
    throw new Error(`unexpected responseA: ${JSON.stringify(response)}`);
  }

  return response;
};
