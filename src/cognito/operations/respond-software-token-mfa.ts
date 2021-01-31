import { SRPError } from "../../util";
import { cognitoFetch } from "../cognito-fetch";
import {
  guardAuthenticationResultResponse,
  guardDeviceChallengeResponse,
} from "../types";

type TRespondSoftwareTokenMfaParams = {
  region: string;
  clientId: string;
  challengeResponses: { username: string; mfaCode: string };
  session: string;
};

export const respondSoftwareTokenMfa = async ({
  region,
  clientId,
  challengeResponses,
  session,
}: TRespondSoftwareTokenMfaParams) => {
  const response = await cognitoFetch({
    operation: "RespondToAuthChallenge",
    region: region,
    args: {
      ChallengeName: "SOFTWARE_TOKEN_MFA",
      ClientId: clientId,
      Session: session,
      ChallengeResponses: {
        USERNAME: challengeResponses.username,
        SOFTWARE_TOKEN_MFA_CODE: challengeResponses.mfaCode,
      },
    },
  });

  if (
    !guardAuthenticationResultResponse(response) &&
    !guardDeviceChallengeResponse(response)
  ) {
    throw new SRPError("Unexpected Response", 500, "respondSoftwareTokenMfa", {
      response,
    });
  }

  return response;
};
