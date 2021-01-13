import { cognitoFetch } from "../cognito-fetch";
import { guardRefreshResult, TCallParams } from "../types";

type TInitiateRefreshTokenParams = Omit<TCallParams, "username"> & {
  refreshToken: string;
};

export const initiateRefreshToken = async ({
  region,
  clientId,
  deviceKey,
  refreshToken,
}: TInitiateRefreshTokenParams) => {
  const response = await cognitoFetch({
    operation: "InitiateAuth",
    region,
    args: {
      AuthFlow: "REFRESH_TOKEN",
      ClientId: clientId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
        DEVICE_KEY: deviceKey,
      },
    },
  });

  if (!guardRefreshResult(response)) {
    throw new Error(`unexpected response: ${JSON.stringify(response)}`);
  }

  return response;
};
