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
  device?: {
    key: string;
    groupKey: string;
    password: string;
  };
};

export async function* srpLogin({
  region,
  userPoolId,
  clientId,
  username,
  password,
  device,
}: TStartSRP) {
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
    const mfaCodeIn = yield "SOFTWARE_TOKEN_MFA";

    if (typeof mfaCodeIn !== "string") {
      throw new Error("Invalid MFA Code");
    }

    const mfaCode = mfaCodeIn.match(/^[0-9]+$/)?.[0];

    if (!mfaCode || mfaCode.length !== 6) {
      throw new Error(`Expected 6 digit MFA code, received: ${mfaCodeIn}`);
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
}
