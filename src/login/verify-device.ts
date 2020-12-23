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
    REGION: poolParams.REGION,
    CLIENT_ID: poolParams.CLIENT_ID,
    USERNAME: deviceParams.username,
    DEVICE_KEY: deviceParams.key,
    SRP_A: bigIntToHex(A),
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
