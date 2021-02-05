export type TNewDeviceMetadata = {
  DeviceKey: string;
  DeviceGroupKey: string;
};

export type TCognitoAuthenticationResult = {
  ExpiresIn: number;
  TokenType: string;
  AccessToken: string;
  RefreshToken: string;
  IdToken: string;
  NewDeviceMetadata?: TNewDeviceMetadata;
};

export type TCognitoAuthenticationResultResponse = {
  AuthenticationResult: TCognitoAuthenticationResult;
};

export type TAuthResponse = {
  username: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
    idToken: string;
    tokenType: string;
    expiresIn: number;
  };
  newDevice?: {
    key: string;
    groupKey: string;
    password?: string;
    deviceAutoConfirmed: boolean;
    userAutoConfirmed?: boolean;
    userConfirmationNecessary?: boolean;
  };
};
