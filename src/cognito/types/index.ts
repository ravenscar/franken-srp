export type TCognitoOperation =
  | "InitiateAuth"
  | "RespondToAuthChallenge"
  | "ConfirmDevice"
  | "GetUser"
  | "ListDevices";

export type TAuthFlowType = "USER_SRP_AUTH" | "REFRESH_TOKEN";
export type TInitiateAuthParams = {
  USER_SRP_AUTH: {
    USERNAME: string;
    SRP_A: string;
    DEVICE_KEY: string | undefined;
  };
  REFRESH_TOKEN: {
    REFRESH_TOKEN: string;
    DEVICE_KEY: string | undefined;
  };
};
export type TInitiateAuth<A extends TAuthFlowType> = {
  AuthFlow: A;
  ClientId: string;
  AuthParameters: TInitiateAuthParams[A];
};

export type TChallengeName =
  | "PASSWORD_VERIFIER"
  | "DEVICE_SRP_AUTH"
  | "DEVICE_PASSWORD_VERIFIER"
  | "SOFTWARE_TOKEN_MFA";
export type TRespondToAuthChallengeParams = {
  PASSWORD_VERIFIER: {
    USERNAME: string;
    TIMESTAMP: string;
    PASSWORD_CLAIM_SECRET_BLOCK: string;
    PASSWORD_CLAIM_SIGNATURE: string;
    DEVICE_KEY: string | undefined;
  };
  SOFTWARE_TOKEN_MFA: {
    USERNAME: string;
    SOFTWARE_TOKEN_MFA_CODE: string;
  };
  DEVICE_SRP_AUTH: {
    USERNAME: string;
    SRP_A: string;
    DEVICE_KEY: string | undefined;
  };
  DEVICE_PASSWORD_VERIFIER: {
    USERNAME: string;
    TIMESTAMP: string;
    PASSWORD_CLAIM_SECRET_BLOCK: string;
    PASSWORD_CLAIM_SIGNATURE: string;
    DEVICE_KEY: string;
  };
};
export type TRespondToAuthChallenge<C extends TChallengeName> = {
  ChallengeName: C;
  ClientId: string;
  Session: string | undefined;
  ChallengeResponses: TRespondToAuthChallengeParams[C];
};

export type TCognitoFetchArgs = {
  InitiateAuth: TInitiateAuth<TAuthFlowType>;
  RespondToAuthChallenge: TRespondToAuthChallenge<TChallengeName>;
  ConfirmDevice: {
    AccessToken: string;
    DeviceKey: string;
    DeviceName: string;
    DeviceSecretVerifierConfig: {
      Salt: string;
      PasswordVerifier: string;
    };
  };
  GetUser: {
    AccessToken: string;
  };
  ListDevices: {
    AccessToken: string;
  };
};
export type TCognitoFetchOptions<O extends TCognitoOperation> = {
  operation: O;
  region: string;
  args: TCognitoFetchArgs[O];
};

export type TSRPChallengeParameters = {
  SALT: string;
  SECRET_BLOCK: string;
  SRP_B: string;
  USER_ID_FOR_SRP: string | undefined;
  USERNAME: string;
  DEVICE_KEY: string | undefined;
};

export type TInitiateUserSrpResponse = {
  ChallengeName: "PASSWORD_VERIFIER";
  ChallengeParameters: TSRPChallengeParameters;
};

export type TInitiateDeviceSrpResponse = {
  ChallengeName: "DEVICE_PASSWORD_VERIFIER";
  ChallengeParameters: TSRPChallengeParameters;
};

export type TNewDeviceMetadata = {
  DeviceKey: string;
  DeviceGroupKey: string;
};

export type TAuthenticationResult = {
  ExpiresIn: number;
  TokenType: string;
  AccessToken: string;
  RefreshToken: string;
  IdToken: string;
  NewDeviceMetadata?: TNewDeviceMetadata;
};
export type TAuthenticationResultResponse = {
  AuthenticationResult: TAuthenticationResult;
};

export type TDeviceChallengeResponse = { ChallengeName: "DEVICE_SRP_AUTH" };

export type TRefreshResult = {
  ExpiresIn: number;
  TokenType: string;
  AccessToken: string;
  IdToken: string;
};
export type TRefreshResultResponse = { AuthenticationResult: TRefreshResult };

export type TUserPoolParams = Record<
  "REGION" | "USER_POOL_ID" | "CLIENT_ID",
  string
>;
export type TLoginParams = Record<"username" | "password", string>;
export type TDeviceParams = Record<"key" | "groupKey" | "password", string>;
