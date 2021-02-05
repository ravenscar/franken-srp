import { SRPError, noop } from "../../util";
import { cognitoFetch } from "../cognito-fetch";
import {
  guardAuthenticationResultResponse,
  guardDeviceChallengeResponse,
} from "../types";

type TRespondSoftwareTokenMfaParams = {
  region: string;
  clientId: string;
  challengeResponses: { username: string; mfaCode: string; deviceKey?: string };
  session: string;
  debug?: (trace: any) => void;
};

export const respondSoftwareTokenMfa = async ({
  region,
  clientId,
  challengeResponses,
  session,
  debug = noop,
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
        DEVICE_KEY: challengeResponses.deviceKey,
      },
    },
    debug,
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
