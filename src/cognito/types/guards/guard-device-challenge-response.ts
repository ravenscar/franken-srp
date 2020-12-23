export type TDeviceChallengeResponse = { ChallengeName: "DEVICE_SRP_AUTH" };

export const guardDeviceChallengeResponse = (
  thing: any
): thing is TDeviceChallengeResponse => {
  if (typeof thing === "object" && thing.ChallengeName === "DEVICE_SRP_AUTH") {
    return true;
  }
  return false;
};
