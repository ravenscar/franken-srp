import { respondDeviceSRPAuth } from "../cognito";
import { guardAuthenticationResultResponse } from "../cognito/types";
import { makeSrpSession } from "../srp";
import { bigIntToHex, SRPError, noop } from "../util";
import { verifySrp } from "./verify-srp";

type TVerifyDevice = {
  region: string;
  userPoolId: string;
  clientId: string;
  deviceKey: string;
  deviceGroupKey: string;
  password: string;
  username: string;
  debug?: (trace: any) => void;
};

export const verifyDevice = async ({
  region,
  userPoolId,
  clientId,
  deviceKey,
  deviceGroupKey,
  password,
  username,
  debug = noop,
}: TVerifyDevice) => {
  const { a, A } = await makeSrpSession();
  debug("calling respondDeviceSRPAuth");
  const responseA = await respondDeviceSRPAuth({
    region,
    clientId,
    username,
    deviceKey,
    srpA: bigIntToHex(A),
    debug,
  });
  debug({ responseA });

  debug("calling verifySrp");
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
    debug,
  });
  debug({ responseB });

  if (!guardAuthenticationResultResponse(responseB)) {
    throw new SRPError("Unexpected Response", 500, "verifyDevice", {
      responseB,
    });
  }

  return responseB;
};
