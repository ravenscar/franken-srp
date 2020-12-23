import { cognitoFetch } from "../cognito-fetch";
import { guardRefreshResult, TCallParams } from "../types";

export const initiateRefreshToken = async (
  { REGION, CLIENT_ID, DEVICE_KEY }: TCallParams,
  { REFRESH_TOKEN }: { REFRESH_TOKEN: string }
) => {
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
