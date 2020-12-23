export type TSoftwareTokenMfaResponse = {
  ChallengeName: "SOFTWARE_TOKEN_MFA";
  Session: string;
};

export const guardSoftwareTokenMfaResponse = (
  thing: any
): thing is TSoftwareTokenMfaResponse => {
  if (
    typeof thing === "object" &&
    thing.ChallengeName === "SOFTWARE_TOKEN_MFA" &&
    typeof thing.Session === "string"
  ) {
    return true;
  }
  return false;
};
