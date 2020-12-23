import {
  initiateUserSRP,
  initiateDeviceSRP,
  sendPasswordClaim,
  sendTokenMfaCode,
  sendRefreshToken,
} from "./cognito";
import { bigIntToHex } from "./util";

import {
  TChallengeName,
  TSRPChallengeParameters,
  TUserPoolParams,
  TLoginParams,
  TDeviceParams,
  guardAuthenticationResultResponse,
  guardDeviceChallengeResponse,
  guardSoftwareTokenMfaResponse,
} from "./cognito/types";

import { calculateClaimSig, makeSrpSession } from "./srp";

type TSrpConfirmation = {
  a: bigint;
  challengeName: "DEVICE_PASSWORD_VERIFIER" | "PASSWORD_VERIFIER";
  challengeParameters: TSRPChallengeParameters;
  deviceKey: string | undefined;
  deviceGroupKey: string | undefined;
};

export const stripPoolRegion = (userPoolId: string) => {
  const poolWithoutRegion = userPoolId.split("_")[1];

  if (!poolWithoutRegion) {
    throw new Error(`can't get regionless pool id from ${userPoolId}`);
  }

  return poolWithoutRegion;
};

export const srpConfirmation = async (
  { REGION, USER_POOL_ID, CLIENT_ID }: TUserPoolParams,
  { password }: Omit<TLoginParams, "username">,
  {
    a,
    challengeName,
    challengeParameters,
    deviceKey,
    deviceGroupKey,
  }: TSrpConfirmation
) => {
  const groupId =
    challengeParameters.DEVICE_KEY && deviceGroupKey
      ? deviceGroupKey
      : stripPoolRegion(USER_POOL_ID);
  const userId =
    challengeParameters.DEVICE_KEY ||
    challengeParameters.USER_ID_FOR_SRP ||
    challengeParameters.USERNAME;

  const { claimSig, timestamp } = await calculateClaimSig(
    a,
    groupId,
    userId,
    password,
    challengeParameters
  );

  return await sendPasswordClaim(
    { REGION, CLIENT_ID, DEVICE_KEY: deviceKey },
    { timestamp, claimSig, challengeParameters, challengeName }
  );
};

export const authenticateDevice = async (
  poolParams: TUserPoolParams,
  deviceParams: TDeviceParams & { username: string }
) => {
  const { a, A } = await makeSrpSession();
  const responseA = await initiateDeviceSRP(
    {
      REGION: poolParams.REGION,
      CLIENT_ID: poolParams.CLIENT_ID,
      USERNAME: deviceParams.username,
      DEVICE_KEY: deviceParams.key,
    },
    { SRP_A: bigIntToHex(A) }
  );

  const responseB = await srpConfirmation(
    poolParams,
    { password: deviceParams.password },
    {
      a,
      challengeName: responseA.ChallengeName,
      challengeParameters: responseA.ChallengeParameters,
      deviceKey: deviceParams.key,
      deviceGroupKey: deviceParams.groupKey,
    }
  );

  if (guardAuthenticationResultResponse(responseB)) {
    return responseB;
  }
};

export const loginWithUsernamePassword = async (
  poolParams: TUserPoolParams,
  loginParams: TLoginParams & { mfaCode?: string },
  deviceParams: TDeviceParams | undefined
) => {
  const { a, A } = await makeSrpSession();
  const responseA = await initiateUserSRP(
    {
      REGION: poolParams.REGION,
      CLIENT_ID: poolParams.CLIENT_ID,
      USERNAME: loginParams.username,
      DEVICE_KEY: deviceParams?.key,
    },
    { SRP_A: bigIntToHex(A) }
  );

  let nextResponse = await srpConfirmation(poolParams, loginParams, {
    a,
    challengeName: responseA.ChallengeName,
    challengeParameters: responseA.ChallengeParameters,
    deviceKey: deviceParams?.key,
    deviceGroupKey: deviceParams?.groupKey,
  });

  if (guardAuthenticationResultResponse(nextResponse)) {
    return nextResponse;
  }

  if (guardSoftwareTokenMfaResponse(nextResponse)) {
    if (!loginParams.mfaCode) {
      throw new Error("Missing MFA Code");
    }
    nextResponse = await sendTokenMfaCode(
      { REGION: poolParams.REGION, CLIENT_ID: poolParams.CLIENT_ID },
      {
        ChallengeResponses: {
          USERNAME: responseA.ChallengeParameters.USERNAME,
          SOFTWARE_TOKEN_MFA_CODE: loginParams.mfaCode,
        },
        session: nextResponse.Session,
      }
    );
  }

  if (guardDeviceChallengeResponse(nextResponse)) {
    if (!deviceParams) {
      throw new Error("missing deviceParams");
    }
    return authenticateDevice(poolParams, {
      ...deviceParams,
      username:
        responseA.ChallengeParameters.USER_ID_FOR_SRP ||
        responseA.ChallengeParameters.USERNAME,
    });
  }

  return nextResponse;
};

export const loginWithRefreshToken = async (
  poolParams: TUserPoolParams,
  { refreshToken }: { refreshToken: string },
  deviceParams: TDeviceParams | undefined
) =>
  sendRefreshToken(
    {
      REGION: poolParams.REGION,
      CLIENT_ID: poolParams.CLIENT_ID,
      USERNAME: "",
      DEVICE_KEY: deviceParams?.key,
    },
    { REFRESH_TOKEN: refreshToken }
  );
