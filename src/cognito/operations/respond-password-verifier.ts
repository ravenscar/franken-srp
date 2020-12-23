import { cognitoFetch } from "../cognito-fetch";
import {
  guardAuthenticationResultResponse,
  guardDeviceChallengeResponse,
  guardSoftwareTokenMfaResponse,
  TCallParams,
  TSRPChallengeParameters,
} from "../types";

type TRespondPasswordVerifierParams = Omit<TCallParams, "USERNAME"> & {
  challengeName: "DEVICE_PASSWORD_VERIFIER" | "PASSWORD_VERIFIER";
  challengeParameters: TSRPChallengeParameters;
  timestamp: string;
  claimSig: string;
};

export const respondPasswordVerifier = async ({
  REGION,
  CLIENT_ID,
  DEVICE_KEY,
  challengeName,
  challengeParameters,
  timestamp,
  claimSig,
}: TRespondPasswordVerifierParams) => {
  const devKey = DEVICE_KEY!;
  if (challengeName === "DEVICE_PASSWORD_VERIFIER" && devKey) {
    throw new Error(
      "DEVICE_KEY must be passed for RespondToAuthChallenge: DEVICE_PASSWORD_VERIFIER"
    );
  }

  const response = await cognitoFetch({
    operation: "RespondToAuthChallenge",
    region: REGION,
    args: {
      ChallengeName: challengeName,
      ClientId: CLIENT_ID,
      ChallengeResponses: {
        DEVICE_KEY: devKey,
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
