export type TSmsMfaResponse = {
  ChallengeName: "SMS_MFA";
  ChallengeParameters: {
    CODE_DELIVERY_DELIVERY_MEDIUM: "SMS";
    CODE_DELIVERY_DESTINATION: string;
  };
  Session: string;
};

export const guardSmsMfaResponse = (thing: any): thing is TSmsMfaResponse => {
  if (
    typeof thing === "object" &&
    thing.ChallengeName === "SMS_MFA" &&
    typeof thing.Session === "string" &&
    typeof thing.ChallengeParameters === "object" &&
    thing.ChallengeParameters.CODE_DELIVERY_DELIVERY_MEDIUM === "SMS" &&
    typeof thing.ChallengeParameters.CODE_DELIVERY_DESTINATION === "string"
  ) {
    return true;
  }
  return false;
};
