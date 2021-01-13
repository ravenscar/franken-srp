import { respondDeviceSRPAuth } from "../cognito";
import { guardAuthenticationResultResponse } from "../cognito/types";
import { makeSrpSession } from "../srp";
import { bigIntToHex } from "../util";
import { verifySrp } from "./verify-srp";

type TVerifyDevice = {
  region: string;
  userPoolId: string;
  clientId: string;
  deviceKey: string;
  deviceGroupKey: string;
  password: string;
  username: string;
};

export const verifyDevice = async ({
  region,
  userPoolId,
  clientId,
  deviceKey,
  deviceGroupKey,
  password,
  username,
}: TVerifyDevice) => {
  const { a, A } = await makeSrpSession();
  const responseA = await respondDeviceSRPAuth({
    region,
    clientId,
    username,
    deviceKey,
    srpA: bigIntToHex(A),
  });

  const responseB = await verifySrp({
    region,
    userPoolId,
    clientId,
    password,
    a,
    challengeName: responseA.ChallengeName,
    challengeParameters: responseA.ChallengeParameters,
    deviceKey,
    deviceGroupKey,
  });

  if (guardAuthenticationResultResponse(responseB)) {
    return responseB;
  }
};
