import {
  TSRPChallengeParameters,
  guardSRPChallengeParameters,
} from "./guard-srp-challenge-parameters";

export type TInitiateUserSrpResponse = {
  ChallengeName: "PASSWORD_VERIFIER";
  ChallengeParameters: TSRPChallengeParameters;
};

export const guardInitiateUserSrpResponse = (
  thing: any
): thing is TInitiateUserSrpResponse => {
  if (
    typeof thing === "object" &&
    thing.ChallengeName === "PASSWORD_VERIFIER" &&
    guardSRPChallengeParameters(thing.ChallengeParameters)
  ) {
    return true;
  }
  return false;
};
