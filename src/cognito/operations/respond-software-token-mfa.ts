import { cognitoFetch } from "../cognito-fetch";
import {
  guardAuthenticationResultResponse,
  guardDeviceChallengeResponse,
  TCallParams,
} from "../types";

export const respondSoftwareTokenMfa = async (
  { REGION, CLIENT_ID }: Omit<TCallParams, "USERNAME" | "DEVICE_KEY">,
  {
    ChallengeResponses,
    session,
  }: {
    ChallengeResponses: { USERNAME: string; SOFTWARE_TOKEN_MFA_CODE: string };
    session: string;
  }
) => {
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
