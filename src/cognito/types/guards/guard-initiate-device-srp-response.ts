import {
  TSRPChallengeParameters,
  guardSRPChallengeParameters,
} from "./guard-srp-challenge-parameters";

export type TInitiateDeviceSrpResponse = {
  ChallengeName: "DEVICE_PASSWORD_VERIFIER";
  ChallengeParameters: TSRPChallengeParameters;
};

export const guardInitiateDeviceSrpResponse = (
  thing: any
): thing is TInitiateDeviceSrpResponse => {
  if (
    typeof thing === "object" &&
    thing.ChallengeName === "DEVICE_PASSWORD_VERIFIER" &&
    guardSRPChallengeParameters(thing.ChallengeParameters)
  ) {
    return true;
  }
  return false;
};
