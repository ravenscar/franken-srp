import { TCognitoAuthenticationResultResponse } from "../authentication-result";
import { guardNewDeviceMetadatata } from "./guard-new-device-metadatata";

export const guardAuthenticationResultResponse = (
  thing: any
): thing is TCognitoAuthenticationResultResponse => {
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
