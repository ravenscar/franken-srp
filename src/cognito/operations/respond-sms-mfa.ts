import { SRPError } from "../../util";
import { cognitoFetch } from "../cognito-fetch";
import {
  guardAuthenticationResultResponse,
  guardDeviceChallengeResponse,
} from "../types";

type TRespondSmsMfaParams = {
  region: string;
  clientId: string;
  challengeResponses: { username: string; mfaCode: string };
  session: string;
};

export const respondSmsMfa = async ({
  region,
  clientId,
  challengeResponses,
  session,
}: TRespondSmsMfaParams) => {
  const response = await cognitoFetch({
    operation: "RespondToAuthChallenge",
    region: region,
    args: {
      ChallengeName: "SMS_MFA",
      ClientId: clientId,
      Session: session,
      ChallengeResponses: {
        USERNAME: challengeResponses.username,
        SMS_MFA_CODE: challengeResponses.mfaCode,
      },
    },
  });

  if (
    !guardAuthenticationResultResponse(response) &&
    !guardDeviceChallengeResponse(response)
  ) {
    throw new SRPError("Unexpected Response", 500, "respondSmsMfa", {
      response,
    });
  }

  return response;
};
