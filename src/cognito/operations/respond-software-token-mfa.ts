import { cognitoFetch } from "../cognito-fetch";
import {
  guardAuthenticationResultResponse,
  guardDeviceChallengeResponse,
  TCallParams,
} from "../types";

type TRespondSoftwareTokenMfaParams = Omit<
  TCallParams,
  "USERNAME" | "DEVICE_KEY"
> & {
  ChallengeResponses: { USERNAME: string; SOFTWARE_TOKEN_MFA_CODE: string };
  session: string;
};

export const respondSoftwareTokenMfa = async ({
  REGION,
  CLIENT_ID,
  ChallengeResponses,
  session,
}: TRespondSoftwareTokenMfaParams) => {
  const response = await cognitoFetch({
    operation: "RespondToAuthChallenge",
    region: REGION,
    args: {
      ChallengeName: "SOFTWARE_TOKEN_MFA",
      ClientId: CLIENT_ID,
      Session: session,
      ChallengeResponses,
    },
  });

  if (
    !guardAuthenticationResultResponse(response) &&
    !guardDeviceChallengeResponse(response)
  ) {
    throw new Error(`unexpected response: ${JSON.stringify(response)}`);
  }

  return response;
};
