import {
  TAuthenticationResultResponse,
  TDeviceChallengeResponse,
  TInitiateDeviceSrpResponse,
  TInitiateUserSrpResponse,
  TNewDeviceMetadata,
  TRefreshResult,
  TSRPChallengeParameters,
} from "../types";

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

export const guardNewDeviceMetadatata = (
  thing: any
): thing is TNewDeviceMetadata => {
  if (
    typeof thing === "object" &&
    typeof thing.DeviceKey === "string" &&
    typeof thing.DeviceGroupKey === "string"
  ) {
    return true;
  }
  return false;
};

export const guardAuthenticationResultResponse = (
  thing: any
): thing is TAuthenticationResultResponse => {
  if (
    typeof thing === "object" &&
    typeof thing.AuthenticationResult === "object" &&
    typeof thing.AuthenticationResult.ExpiresIn === "number" &&
    typeof thing.AuthenticationResult.TokenType === "string" &&
    typeof thing.AuthenticationResult.IdToken === "string" &&
    typeof thing.AuthenticationResult.AccessToken === "string" &&
    typeof thing.AuthenticationResult.RefreshToken === "string" &&
    (!thing.AuthenticationResult.NewDeviceMetadata ||
      guardNewDeviceMetadatata(thing.AuthenticationResult.NewDeviceMetadata))
  ) {
    return true;
  }
  return false;
};

export const guardRefreshResult = (thing: any): thing is TRefreshResult => {
  if (
    typeof thing === "object" &&
    typeof thing.AuthenticationResult === "object" &&
    typeof thing.AuthenticationResult.ExpiresIn === "number" &&
    typeof thing.AuthenticationResult.TokenType === "string" &&
    typeof thing.AuthenticationResult.IdToken === "string" &&
    typeof thing.AuthenticationResult.AccessToken === "string"
  ) {
    return true;
  }
  return false;
};

export const guardDeviceChallengeResponse = (
  thing: any
): thing is TDeviceChallengeResponse => {
  if (typeof thing === "object" && thing.ChallengeName === "DEVICE_SRP_AUTH") {
    return true;
  }
  return false;
};

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
