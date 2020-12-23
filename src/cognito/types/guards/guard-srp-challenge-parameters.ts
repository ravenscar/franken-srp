export type TSRPChallengeParameters = {
  SALT: string;
  SECRET_BLOCK: string;
  SRP_B: string;
  USER_ID_FOR_SRP: string | undefined;
  USERNAME: string;
  DEVICE_KEY: string | undefined;
};

export const guardSRPChallengeParameters = (
  thing: any
): thing is TSRPChallengeParameters => {
  if (
    typeof thing === "object" &&
    typeof thing.SALT === "string" &&
    typeof thing.SECRET_BLOCK === "string" &&
    typeof thing.SRP_B === "string" &&
    typeof thing.USERNAME === "string" &&
    (typeof thing.USER_ID_FOR_SRP === "string" ||
      thing.USER_ID_FOR_SRP === undefined) &&
    (typeof thing.DEVICE_KEY === "string" || thing.DEVICE_KEY === undefined)
  ) {
    return true;
  }
  return false;
};
