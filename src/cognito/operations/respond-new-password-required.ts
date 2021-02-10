import { SRPError, noop } from "../../util";
import { cognitoFetch } from "../cognito-fetch";
import {
  guardAuthenticationResultResponse,
  guardDeviceChallengeResponse,
  guardSmsMfaResponse,
  guardSoftwareTokenMfaResponse,
} from "../types";

type TRespondNewPasswordRequiredParams = {
  region: string;
  clientId: string;
  challengeResponses: { username: string; newPassword: string };
  session: string;
  debug?: (trace: any) => void;
};

export const respondNewPasswordRequired = async ({
  region,
  clientId,
  challengeResponses,
  session,
  debug = noop,
}: TRespondNewPasswordRequiredParams) => {
  const response = await cognitoFetch({
    operation: "RespondToAuthChallenge",
    region: region,
    args: {
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      ClientId: clientId,
      Session: session,
      ChallengeResponses: {
        USERNAME: challengeResponses.username,
        NEW_PASSWORD: challengeResponses.newPassword,
      },
    },
    debug,
  });

  if (
    !guardAuthenticationResultResponse(response) &&
    !guardDeviceChallengeResponse(response) &&
    !guardSoftwareTokenMfaResponse(response) &&
    !guardSmsMfaResponse(response)
  ) {
    throw new SRPError(
      "Unexpected Response",
      500,
      "respondNewPasswordRequired",
      {
        response,
      }
    );
  }

  return response;
};
