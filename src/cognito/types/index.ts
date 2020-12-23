export * from "./guards";

type TAuthFlowType = "USER_SRP_AUTH" | "REFRESH_TOKEN";

type TInitiateAuthParams = {
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

type TInitiateAuth<A extends TAuthFlowType> = {
  AuthFlow: A;
  ClientId: string;
  AuthParameters: TInitiateAuthParams[A];
};

type TRespondToAuthChallengeParams =
  | {
      ChallengeName: "PASSWORD_VERIFIER";
      ChallengeResponses: {
        USERNAME: string;
        TIMESTAMP: string;
        PASSWORD_CLAIM_SECRET_BLOCK: string;
        PASSWORD_CLAIM_SIGNATURE: string;
        DEVICE_KEY: string | undefined;
      };
    }
  | {
      ChallengeName: "DEVICE_SRP_AUTH";
      ChallengeResponses: {
        USERNAME: string;
        SRP_A: string;
        DEVICE_KEY: string | undefined;
      };
    }
  | {
      ChallengeName: "DEVICE_PASSWORD_VERIFIER";
      ChallengeResponses: {
        USERNAME: string;
        TIMESTAMP: string;
        PASSWORD_CLAIM_SECRET_BLOCK: string;
        PASSWORD_CLAIM_SIGNATURE: string;
        DEVICE_KEY: string;
      };
    }
  | {
      ChallengeName: "SOFTWARE_TOKEN_MFA";
      ChallengeResponses: {
        USERNAME: string;
        SOFTWARE_TOKEN_MFA_CODE: string;
      };
    };

type TRespondToAuthChallenge = TRespondToAuthChallengeParams & {
  ClientId: string;
  Session: string | undefined;
};

type TCognitoFetchArgs = {
  InitiateAuth: TInitiateAuth<TAuthFlowType>;
  RespondToAuthChallenge: TRespondToAuthChallenge;
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

export type TChallengeName = TRespondToAuthChallengeParams["ChallengeName"];

export type TCognitoOperation =
  | "InitiateAuth"
  | "RespondToAuthChallenge"
  | "ConfirmDevice"
  | "GetUser"
  | "ListDevices";

export type TCognitoFetchOptions<O extends TCognitoOperation> = {
  operation: O;
  region: string;
  args: TCognitoFetchArgs[O];
};

export type TUserPoolParams = Record<
  "REGION" | "USER_POOL_ID" | "CLIENT_ID",
  string
>;
export type TLoginParams = Record<"username" | "password", string>;
export type TDeviceParams = Record<"key" | "groupKey" | "password", string>;
