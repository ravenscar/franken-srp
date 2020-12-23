import {
  TSRPChallengeParameters,
  guardInitiateUserSrpResponse,
  guardInitiateDeviceSrpResponse,
  guardAuthenticationResultResponse,
  guardDeviceChallengeResponse,
  guardRefreshResult,
  guardSoftwareTokenMfaResponse,
} from "./types";

import { cognitoFetch } from "./cognito-fetch";

type TCallParams = Record<"USERNAME" | "REGION" | "CLIENT_ID", string> &
  Record<"DEVICE_KEY", string | undefined>;

export const initiateUserSRP = async (
  { USERNAME, REGION, CLIENT_ID, DEVICE_KEY }: TCallParams,
  { SRP_A }: { SRP_A: string }
) => {
  const response = await cognitoFetch({
    operation: "InitiateAuth",
    region: REGION,
    args: {
      AuthFlow: "USER_SRP_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME,
        SRP_A,
        DEVICE_KEY,
      },
    },
  });

  if (!guardInitiateUserSrpResponse(response)) {
    throw new Error(`unexpected responseA: ${JSON.stringify(response)}`);
  }

  return response;
};

export const initiateDeviceSRP = async (
  { USERNAME, REGION, CLIENT_ID, DEVICE_KEY }: TCallParams,
  { SRP_A }: { SRP_A: string }
) => {
  const response = await cognitoFetch({
    operation: "RespondToAuthChallenge",
    region: REGION,
    args: {
      ChallengeName: "DEVICE_SRP_AUTH",
      ClientId: CLIENT_ID,
      ChallengeResponses: {
        USERNAME,
        SRP_A,
        DEVICE_KEY,
      },
      Session: undefined,
    },
  });

  if (!guardInitiateDeviceSrpResponse(response)) {
    throw new Error(`unexpected responseA: ${JSON.stringify(response)}`);
  }

  return response;
};

export const sendRefreshToken = async (
  { REGION, CLIENT_ID, DEVICE_KEY }: TCallParams,
  { REFRESH_TOKEN }: { REFRESH_TOKEN: string }
) => {
  const response = await cognitoFetch({
    operation: "InitiateAuth",
    region: REGION,
    args: {
      AuthFlow: "REFRESH_TOKEN",
      ClientId: CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN,
        DEVICE_KEY,
      },
    },
  });

  if (!guardRefreshResult(response)) {
    throw new Error(`unexpected response: ${JSON.stringify(response)}`);
  }

  return response;
};

export const sendTokenMfaCode = async (
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

export const sendPasswordClaim = async (
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
