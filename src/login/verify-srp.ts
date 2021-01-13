import { respondPasswordVerifier } from "../cognito";
import { TSRPChallengeParameters } from "../cognito/types";
import { calculateClaimSig } from "../srp";
import { stripPoolRegion } from "../util";

type TVerifySrp = {
  region: string;
  userPoolId: string;
  clientId: string;
  password: string;
  a: bigint;
  challengeName: "DEVICE_PASSWORD_VERIFIER" | "PASSWORD_VERIFIER";
  challengeParameters: TSRPChallengeParameters;
  deviceKey: string | undefined;
  deviceGroupKey: string | undefined;
};

export const verifySrp = async ({
  region,
  userPoolId,
  clientId,
  password,
  a,
  challengeName,
  challengeParameters,
  deviceKey,
  deviceGroupKey,
}: TVerifySrp) => {
  const groupId =
    challengeParameters.DEVICE_KEY && deviceGroupKey
      ? deviceGroupKey
      : stripPoolRegion(userPoolId);
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
    region,
    clientId,
    deviceKey,
    timestamp,
    claimSig,
    challengeParameters,
    challengeName,
  });
};
