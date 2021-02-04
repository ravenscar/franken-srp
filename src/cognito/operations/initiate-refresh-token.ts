import { SRPError } from "../../util";
import { cognitoFetch } from "../cognito-fetch";
import { guardRefreshResult } from "../types";

type TInitiateRefreshTokenParams = {
  region: string;
  clientId: string;
  deviceKey?: string;
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
    throw new SRPError("Unexpected Response", 500, "guardRefreshResult", {
      response,
    });
  }

  return {
    tokenType: response.AuthenticationResult.TokenType,
    expiresIn: response.AuthenticationResult.ExpiresIn,
    idToken: response.AuthenticationResult.IdToken,
    accessToken: response.AuthenticationResult.AccessToken,
  };
};
