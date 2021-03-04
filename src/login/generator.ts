import {
  confirmDevice,
  initiateUserSRPAuth,
  respondNewPasswordRequired,
  respondSmsMfa,
  respondSoftwareTokenMfa,
} from "../cognito";
import {
  guardAuthenticationResultResponse,
  guardDeviceChallengeResponse,
  guardNewPasswordRequired,
  guardSmsMfaResponse,
  guardSoftwareTokenMfaResponse,
} from "../cognito/types";
import {
  TCognitoAuthenticationResultResponse,
  TAuthResponse,
} from "../cognito/types/authentication-result";
import { makeSrpSession } from "../srp";
import { bigIntToHex, SRPError } from "../util";
import { verifyDevice } from "./verify-device";
import { verifySrp } from "./verify-srp";

const authStepCodes = [
  "TOKENS",
  "ERROR",
  "SMS_MFA_REQUIRED",
  "SOFTWARE_MFA_REQUIRED",
  "NEW_PASSWORD_REQUIRED",
] as const;

type TAuthStepCode = typeof authStepCodes[number];

export type TAuthStep = {
  code: TAuthStepCode;
  error?: Error;
  response?: TAuthResponse;
  hint?: string;
};

export type TSrpLoginParams = {
  region: string;
  userPoolId: string;
  clientId: string;
  username: string;
  password: string;
  device:
    | {
        key: string;
        groupKey: string;
        password: string;
      }
    | undefined;
  autoConfirmDevice: boolean;
  autoRememberDevice: Parameters<
    typeof confirmDevice
  >["0"]["autoRememberDevice"];
  debugTracing?: boolean;
};

export type TSrpLoginResponse = AsyncGenerator<TAuthStep, TAuthStep, string>;

export async function* srpLogin({
  region,
  userPoolId,
  clientId,
  username,
  password,
  device,
  autoConfirmDevice,
  autoRememberDevice,
  debugTracing,
}: TSrpLoginParams): TSrpLoginResponse {
  const debugTraces: any[] = [];
  const debug = (trace: any) => {
    if (debugTracing) {
      debugTraces.push(trace);
    }
  };
  const printTrace = () => {
    for (const trace of debugTraces) {
      console.log(trace);
    }
  };

  const returnTokens = async ({
    AuthenticationResult: cognitoRes,
  }: TCognitoAuthenticationResultResponse): Promise<TAuthStep> => {
    const authResponse: TAuthResponse = {
      username,
      tokens: {
        accessToken: cognitoRes.AccessToken,
        idToken: cognitoRes.IdToken,
        refreshToken: cognitoRes.RefreshToken,
        tokenType: cognitoRes.TokenType,
        expiresIn: cognitoRes.ExpiresIn,
      },
      newDevice: undefined,
    };

    debug("created provisional TAuthResponse");
    debug({ authResponse });

    if (cognitoRes.NewDeviceMetadata) {
      authResponse.newDevice = {
        key: cognitoRes.NewDeviceMetadata.DeviceKey,
        groupKey: cognitoRes.NewDeviceMetadata.DeviceGroupKey,
        deviceAutoConfirmed: false,
      };

      if (autoConfirmDevice) {
        debug("auto confirming device");
        const confirmDeviceParams = {
          region,
          accessToken: authResponse.tokens.accessToken,
          deviceKey: cognitoRes.NewDeviceMetadata.DeviceKey,
          deviceGroupKey: cognitoRes.NewDeviceMetadata.DeviceGroupKey,
          autoRememberDevice,
          debug,
        };

        debug("calling confirmDevice");
        debug({ callParams: confirmDeviceParams });
        const newDevice = await confirmDevice(confirmDeviceParams);
        debug({ response: newDevice });

        authResponse.newDevice = {
          key: cognitoRes.NewDeviceMetadata.DeviceKey,
          groupKey: cognitoRes.NewDeviceMetadata.DeviceGroupKey,
          password: newDevice.devicePassword,
          deviceAutoConfirmed: newDevice.deviceAutoConfirmed,
          deviceAutoRemembered: newDevice.deviceAutoRemembered,
          userConfirmationNecessary: newDevice.userConfirmationNecessary,
        };
      } else {
        debug("NOT auto confirming device");
      }
    }

    debug("returning TOKENS");
    debug({ authResponse });

    printTrace();

    return {
      code: "TOKENS",
      response: authResponse,
    };
  };

  try {
    const { a, A } = await makeSrpSession();
    const initiateUserSRPAuthParams = {
      region,
      clientId,
      username,
      deviceKey: device?.key,
      srpA: bigIntToHex(A),
      debug,
    };
    debug("calling initiateUserSRPAuth");
    debug({ callParams: initiateUserSRPAuthParams });
    const responseA = await initiateUserSRPAuth(initiateUserSRPAuthParams);
    debug({ response: responseA });

    const verifySrpParams = {
      region,
      userPoolId,
      clientId,
      password,
      a,
      challengeName: responseA.ChallengeName,
      challengeParameters: responseA.ChallengeParameters,
      deviceKey: device?.key,
      deviceGroupKey: device?.groupKey,
      debug,
    };
    debug("calling verifySrp");
    debug({ callParams: verifySrpParams });
    let nextResponse = await verifySrp(verifySrpParams);
    debug({ response: nextResponse });

    if (guardAuthenticationResultResponse(nextResponse)) {
      debug(
        "guardAuthenticationResultResponse returned true, returning tokens"
      );
      return returnTokens(nextResponse);
    }

    if (guardNewPasswordRequired(nextResponse)) {
      const newPassword = yield { code: "NEW_PASSWORD_REQUIRED" };

      if (typeof newPassword !== "string") {
        throw new SRPError("Invalid new password", 401, "NEW_PASSWORD", {
          newPassword,
        });
      }

      nextResponse = await respondNewPasswordRequired({
        region,
        clientId,
        challengeResponses: {
          newPassword,
          username: responseA.ChallengeParameters.USERNAME,
        },
        session: nextResponse.Session,
        debug,
      });
    }

    if (guardSoftwareTokenMfaResponse(nextResponse)) {
      const session = nextResponse.Session;
      let valid = false;
      let errorResponse: Error | undefined;

      while (!valid) {
        const mfaCodeIn = yield {
          code: "SOFTWARE_MFA_REQUIRED",
          error: errorResponse,
        };

        try {
          if (typeof mfaCodeIn !== "string") {
            throw new SRPError("Invalid MFA Code", 401, "MFA", { mfaCodeIn });
          }

          const mfaCode = mfaCodeIn.match(/^[0-9]+$/)?.[0];

          if (!mfaCode || mfaCode.length !== 6) {
            throw new SRPError(
              `Expected 6 digit MFA code, received: ${mfaCodeIn}`,
              401,
              "MFA",
              { mfaCode, mfaCodeIn }
            );
          }

          nextResponse = await respondSoftwareTokenMfa({
            region,
            clientId,
            challengeResponses: {
              mfaCode,
              username: responseA.ChallengeParameters.USERNAME,
              deviceKey: device?.key,
            },
            session,
            debug,
          });
          valid = true;
        } catch (e) {
          if (e.message !== "Invalid code received for user") {
            throw e;
          }
          errorResponse = e;
        }
      }
      if (guardSoftwareTokenMfaResponse(nextResponse)) {
        throw new Error(`this can't happen but fixes the types`); // hubris
      }
    }

    if (guardSmsMfaResponse(nextResponse)) {
      const session = nextResponse.Session;
      const hint = nextResponse.ChallengeParameters.CODE_DELIVERY_DESTINATION;
      let valid = false;
      let errorResponse: Error | undefined;

      while (!valid) {
        const mfaCodeIn = yield {
          code: "SMS_MFA_REQUIRED",
          error: errorResponse,
          hint,
        };

        try {
          if (typeof mfaCodeIn !== "string") {
            throw new SRPError("Invalid MFA Code", 401, "MFA", { mfaCodeIn });
          }

          const mfaCode = mfaCodeIn.match(/^[0-9]+$/)?.[0];

          if (!mfaCode || mfaCode.length !== 6) {
            throw new SRPError(
              `Expected 6 digit MFA code, received: ${mfaCodeIn}`,
              401,
              "MFA",
              { mfaCode, mfaCodeIn }
            );
          }

          nextResponse = await respondSmsMfa({
            region,
            clientId,
            challengeResponses: {
              mfaCode,
              username: responseA.ChallengeParameters.USERNAME,
              deviceKey: device?.key,
            },
            session,
            debug,
          });
        } catch (e) {
          // Why would this error be different than the TOTP one above?
          // Because Cognito sucks, that's why.
          // They can't even keep the punctuation consistent!
          if (e.message !== "Invalid code or auth state for the user") {
            throw e;
          }
          errorResponse = e;
        }
      }

      if (guardSmsMfaResponse(nextResponse)) {
        throw new Error(`this can't happen but fixes the types`); // hubris
      }
    }

    if (guardDeviceChallengeResponse(nextResponse)) {
      if (!device) {
        throw new SRPError("Missing deviceParams", 500, "device", {});
      }
      nextResponse = await verifyDevice({
        clientId,
        region,
        userPoolId,
        deviceKey: device.key,
        deviceGroupKey: device.groupKey,
        password: device.password,
        username:
          responseA.ChallengeParameters.USER_ID_FOR_SRP ||
          responseA.ChallengeParameters.USERNAME,
        debug,
      });
    }

    return returnTokens(nextResponse);
  } catch (error) {
    printTrace();
    return {
      error,
      code: "ERROR",
    };
  }
}
