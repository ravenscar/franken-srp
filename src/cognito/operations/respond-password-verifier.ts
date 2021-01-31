import { cognitoFetch } from "../cognito-fetch";
import {
  guardAuthenticationResultResponse,
  guardDeviceChallengeResponse,
  guardSmsMfaResponse,
  guardSoftwareTokenMfaResponse,
  TSRPChallengeParameters,
} from "../types";

type TRespondPasswordVerifierParams = {
  region: string;
  clientId: string;
  deviceKey?: string;
  challengeName: "DEVICE_PASSWORD_VERIFIER" | "PASSWORD_VERIFIER";
  challengeParameters: TSRPChallengeParameters;
  timestamp: string;
  claimSig: string;
};

export const respondPasswordVerifier = async ({
  region,
  clientId,
  deviceKey,
  challengeName,
  challengeParameters,
  timestamp,
  claimSig,
}: TRespondPasswordVerifierParams) => {
  const devKey = deviceKey!;
  if (challengeName === "DEVICE_PASSWORD_VERIFIER" && devKey) {
    throw new Error(
      "deviceKey must be passed for RespondToAuthChallenge: DEVICE_PASSWORD_VERIFIER"
    );
  }

  const response = await cognitoFetch({
    operation: "RespondToAuthChallenge",
    region: region,
    args: {
      ChallengeName: challengeName,
      ClientId: clientId,
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
    !guardSoftwareTokenMfaResponse(response) &&
    !guardSmsMfaResponse(response)
  ) {
    throw new Error(`unexpected response: ${JSON.stringify(response)}`);
  }

  return response;
};
