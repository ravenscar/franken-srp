import { SRPError, noop } from "../../util";
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
  debug?: (trace: any) => void;
};

export const respondPasswordVerifier = async ({
  region,
  clientId,
  deviceKey,
  challengeName,
  challengeParameters,
  timestamp,
  claimSig,
  debug = noop,
}: TRespondPasswordVerifierParams) => {
  const devKey = deviceKey!;
  if (challengeName === "DEVICE_PASSWORD_VERIFIER" && !devKey) {
    throw new SRPError("Missing deviceKey", 500, "respondPasswordVerifier", {
      challengeName,
      deviceKey,
    });
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
    debug,
  });

  if (
    !guardAuthenticationResultResponse(response) &&
    !guardDeviceChallengeResponse(response) &&
    !guardSoftwareTokenMfaResponse(response) &&
    !guardSmsMfaResponse(response)
  ) {
    throw new SRPError("Unexpected Response", 500, "respondPasswordVerifier", {
      response,
    });
  }

  return response;
};
