import { initiateUserSRPAuth, respondSoftwareTokenMfa } from "../cognito";
import {
  guardAuthenticationResultResponse,
  guardDeviceChallengeResponse,
  guardSoftwareTokenMfaResponse,
  TDeviceParams,
  TLoginParams,
  TUserPoolParams,
} from "../cognito/types";
import { makeSrpSession } from "../srp";
import { bigIntToHex } from "../util";
import { verifyDevice } from "./verify-device";
import { verifySrp } from "./verify-srp";

export const startSRP = async (
  poolParams: TUserPoolParams,
  loginParams: TLoginParams & { mfaCode?: string },
  deviceParams: TDeviceParams | undefined
) => {
  const { a, A } = await makeSrpSession();
  const responseA = await initiateUserSRPAuth({
    REGION: poolParams.REGION,
    CLIENT_ID: poolParams.CLIENT_ID,
    USERNAME: loginParams.username,
    DEVICE_KEY: deviceParams?.key,
    SRP_A: bigIntToHex(A),
  });

  let nextResponse = await verifySrp(poolParams, loginParams, {
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
    nextResponse = await respondSoftwareTokenMfa({
      REGION: poolParams.REGION,
      CLIENT_ID: poolParams.CLIENT_ID,
      ChallengeResponses: {
        USERNAME: responseA.ChallengeParameters.USERNAME,
        SOFTWARE_TOKEN_MFA_CODE: loginParams.mfaCode,
      },
      session: nextResponse.Session,
    });
  }

  if (guardDeviceChallengeResponse(nextResponse)) {
    if (!deviceParams) {
      throw new Error("missing deviceParams");
    }
    return verifyDevice(poolParams, {
      ...deviceParams,
      username:
        responseA.ChallengeParameters.USER_ID_FOR_SRP ||
        responseA.ChallengeParameters.USERNAME,
    });
  }

  return nextResponse;
};
