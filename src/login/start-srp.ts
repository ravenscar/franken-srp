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
    region: poolParams.region,
    clientId: poolParams.clientId,
    username: loginParams.username,
    deviceKey: deviceParams?.key,
    srpA: bigIntToHex(A),
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
      region: poolParams.region,
      clientId: poolParams.clientId,
      challengeResponses: {
        username: responseA.ChallengeParameters.USERNAME,
        mfaCode: loginParams.mfaCode,
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
