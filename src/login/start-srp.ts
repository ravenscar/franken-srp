import { initiateUserSRPAuth, respondSoftwareTokenMfa } from "../cognito";
import {
  guardAuthenticationResultResponse,
  guardDeviceChallengeResponse,
  guardSoftwareTokenMfaResponse,
} from "../cognito/types";
import { makeSrpSession } from "../srp";
import { bigIntToHex } from "../util";
import { verifyDevice } from "./verify-device";
import { verifySrp } from "./verify-srp";

type TStartSRP = {
  region: string;
  userPoolId: string;
  clientId: string;
  username: string;
  password: string;
  mfaCode?: string;
  device?: {
    key: string;
    groupKey: string;
    password: string;
  };
};

export const startSRP = async ({
  region,
  userPoolId,
  clientId,
  username,
  password,
  mfaCode,
  device,
}: TStartSRP) => {
  const { a, A } = await makeSrpSession();
  const responseA = await initiateUserSRPAuth({
    region,
    clientId,
    username,
    deviceKey: device?.key,
    srpA: bigIntToHex(A),
  });

  let nextResponse = await verifySrp({
    region,
    userPoolId,
    clientId,
    password,
    a,
    challengeName: responseA.ChallengeName,
    challengeParameters: responseA.ChallengeParameters,
    deviceKey: device?.key,
    deviceGroupKey: device?.groupKey,
  });

  if (guardAuthenticationResultResponse(nextResponse)) {
    return nextResponse;
  }

  if (guardSoftwareTokenMfaResponse(nextResponse)) {
    if (!mfaCode) {
      throw new Error("Missing MFA Code");
    }
    nextResponse = await respondSoftwareTokenMfa({
      region,
      clientId,
      challengeResponses: {
        mfaCode,
        username: responseA.ChallengeParameters.USERNAME,
      },
      session: nextResponse.Session,
    });
  }

  if (guardDeviceChallengeResponse(nextResponse)) {
    if (!device) {
      throw new Error("missing deviceParams");
    }
    return verifyDevice({
      clientId,
      region,
      userPoolId,
      deviceKey: device.key,
      deviceGroupKey: device.groupKey,
      password: device.password,
      username:
        responseA.ChallengeParameters.USER_ID_FOR_SRP ||
        responseA.ChallengeParameters.USERNAME,
    });
  }

  return nextResponse;
};
