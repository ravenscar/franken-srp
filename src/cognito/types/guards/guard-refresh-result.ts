export type TRefreshResult = {
  ExpiresIn: number;
  TokenType: string;
  AccessToken: string;
  IdToken: string;
};
export type TRefreshResultResponse = { AuthenticationResult: TRefreshResult };

export const guardRefreshResult = (
  thing: any
): thing is TRefreshResultResponse => {
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
