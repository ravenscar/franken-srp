import { cognitoFetch } from "../cognito-fetch";
import {
  guardAuthenticationResultResponse,
  guardDeviceChallengeResponse,
  guardSoftwareTokenMfaResponse,
  TCallParams,
  TSRPChallengeParameters,
} from "../types";

export const respondPasswordVerifier = async (
  { REGION, CLIENT_ID, DEVICE_KEY }: Omit<TCallParams, "USERNAME">,
  {
    challengeName,
    challengeParameters,
    timestamp,
    claimSig,
  }: {
    challengeName: "DEVICE_PASSWORD_VERIFIER" | "PASSWORD_VERIFIER";
    challengeParameters: TSRPChallengeParameters;
    timestamp: string;
    claimSig: string;
  }
) => {
  const response = await cognitoFetch({
    operation: "RespondToAuthChallenge",
    region: REGION,
    args: {
      ChallengeName: "PASSWORD_VERIFIER",
      ClientId: CLIENT_ID,
      ChallengeResponses: {
        DEVICE_KEY,
        USERNAME:
          challengeParameters.USER_ID_FOR_SRP || challengeParameters.USERNAME,
        PASSWORD_CLAIM_SECRET_BLOCK: challengeParameters.SECRET_BLOCK,
        PASSWORD_CLAIM_SIGNATURE: claimSig,
        TIMESTAMP: timestamp,
      },
      Session: undefined,
    },
  });

  if (
    !guardAuthenticationResultResponse(response) &&
    !guardDeviceChallengeResponse(response) &&
    !guardSoftwareTokenMfaResponse(response)
  ) {
    throw new Error(`unexpected response: ${JSON.stringify(response)}`);
  }

  return response;
};
