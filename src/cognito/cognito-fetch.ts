import { SRPError, noop } from "../util";

export const cognitoFetch = async ({
  operation,
  region,
  args,
  debug = noop,
}: TCognitoFetchArgs & { region: string }) => {
  const endpoint = `https://cognito-idp.${region}.amazonaws.com/`;

  const headers = {
    "Content-Type": "application/x-amz-json-1.1",
    "X-Amz-Target": `AWSCognitoIdentityProviderService.${operation}`,
    "X-Amz-User-Agent": "amazon",
  };

  debug(`cognitoFetch called ${operation} ${region} ${endpoint}`);
  debug({ headers });
  debug({ args });

  const response = await fetch(endpoint, {
    headers,
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    body: JSON.stringify(args),
  });

  if (response.ok) {
    const jsonResponse = await response.json();
    debug({ jsonResponse });

    return jsonResponse;
  }

  let errorText = response.statusText;
  let errorDetail = {};

  try {
    const json = await response.json();
    errorDetail = json;
    errorText = json.message || errorText;
  } catch (e) {
    errorDetail = e;
  }

  throw new SRPError(errorText, response.status, "Fetch", errorDetail);
};

type TInitiateAuthParams =
  | {
      AuthFlow: "USER_SRP_AUTH";
      AuthParameters: {
        USERNAME: string;
        SRP_A: string;
        DEVICE_KEY: string | undefined;
      };
    }
  | {
      AuthFlow: "REFRESH_TOKEN";
      AuthParameters: {
        REFRESH_TOKEN: string;
        DEVICE_KEY: string | undefined;
      };
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
        DEVICE_KEY: string | undefined;
      };
    }
  | {
      ChallengeName: "SMS_MFA";
      ChallengeResponses: {
        USERNAME: string;
        SMS_MFA_CODE: string;
        DEVICE_KEY: string | undefined;
      };
    };

type TCognitoFetchArgs = { debug?: (trace: any) => void } & (
  | {
      operation: "InitiateAuth";
      args: TInitiateAuthParams & { ClientId: string };
    }
  | {
      operation: "RespondToAuthChallenge";
      args: TRespondToAuthChallengeParams & {
        ClientId: string;
        Session: string | undefined;
      };
    }
  | {
      operation: "ConfirmDevice";
      args: {
        AccessToken: string;
        DeviceKey: string;
        DeviceName: string;
        DeviceSecretVerifierConfig: {
          Salt: string;
          PasswordVerifier: string;
        };
      };
    }
  | {
      operation: "UpdateDeviceStatus";
      args: {
        AccessToken: string;
        DeviceKey: string;
        DeviceRememberedStatus: "not_remembered" | "remembered";
      };
    }
  | {
      operation: "GetUser";
      args: {
        AccessToken: string;
      };
    }
  | {
      operation: "ListDevices";
      args: {
        AccessToken: string;
      };
    }
);
