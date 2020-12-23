import { cognitoFetch } from "../cognito-fetch";
import { guardRefreshResult, TCallParams } from "../types";

type TInitiateRefreshTokenParams = TCallParams & { REFRESH_TOKEN: string };

export const initiateRefreshToken = async ({
  REGION,
  CLIENT_ID,
  DEVICE_KEY,
  REFRESH_TOKEN,
}: TInitiateRefreshTokenParams) => {
  const response = await cognitoFetch({
    operation: "InitiateAuth",
    region: REGION,
    args: {
      AuthFlow: "REFRESH_TOKEN",
      ClientId: CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN,
        DEVICE_KEY,
      },
    },
  });

  if (!guardRefreshResult(response)) {
    throw new Error(`unexpected response: ${JSON.stringify(response)}`);
  }

  return response;
};
