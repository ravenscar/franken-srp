import { respondPasswordVerifier } from "../cognito";
import {
  TLoginParams,
  TSRPChallengeParameters,
  TUserPoolParams,
} from "../cognito/types";
import { calculateClaimSig } from "../srp";
import { stripPoolRegion } from "../util";

type TSrpConfirmation = {
  a: bigint;
  challengeName: "DEVICE_PASSWORD_VERIFIER" | "PASSWORD_VERIFIER";
  challengeParameters: TSRPChallengeParameters;
  deviceKey: string | undefined;
  deviceGroupKey: string | undefined;
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

  return await respondPasswordVerifier({
    REGION,
    CLIENT_ID,
    DEVICE_KEY: deviceKey,
    timestamp,
    claimSig,
    challengeParameters,
    challengeName,
  });
};
