export type TNewPasswordRequired = {
  ChallengeName: "NEW_PASSWORD_REQUIRED";
  Session: string;
};

export const guardNewPasswordRequired = (
  thing: any
): thing is TNewPasswordRequired => {
  if (
    typeof thing === "object" &&
    thing.ChallengeName === "NEW_PASSWORD_REQUIRED" &&
    typeof thing.Session === "string"
  ) {
    return true;
  }
  return false;
};
