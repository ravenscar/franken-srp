import { respondDeviceSRPAuth } from "../cognito";
import {
  guardAuthenticationResultResponse,
  TDeviceParams,
  TUserPoolParams,
} from "../cognito/types";
import { makeSrpSession } from "../srp";
import { bigIntToHex } from "../util";
import { verifySrp } from "./verify-srp";

export const verifyDevice = async (
  poolParams: TUserPoolParams,
  deviceParams: TDeviceParams & { username: string }
) => {
  const { a, A } = await makeSrpSession();
  const responseA = await respondDeviceSRPAuth({
    region: poolParams.region,
    clientId: poolParams.clientId,
    username: deviceParams.username,
    deviceKey: deviceParams.key,
    srpA: bigIntToHex(A),
  });

  const responseB = await verifySrp(
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
