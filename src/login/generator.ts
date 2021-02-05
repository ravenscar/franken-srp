import {
  confirmDevice,
  initiateUserSRPAuth,
  respondSmsMfa,
  respondSoftwareTokenMfa,
} from "../cognito";
import {
  guardAuthenticationResultResponse,
  guardDeviceChallengeResponse,
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

    if (autoConfirmDevice && cognitoRes.NewDeviceMetadata) {
      debug("auto confirming device");
      const confirmDeviceParams = {
        region,
        accessToken: authResponse.tokens.accessToken,
        deviceKey: cognitoRes.NewDeviceMetadata.DeviceKey,
        deviceGroupKey: cognitoRes.NewDeviceMetadata.DeviceGroupKey,
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
      };
    } else {
      debug("NOT auto confirming device");
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

    if (guardSoftwareTokenMfaResponse(nextResponse)) {
      const mfaCodeIn = yield { code: "SOFTWARE_MFA_REQUIRED" };

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
        session: nextResponse.Session,
        debug,
      });
    }

    if (guardSmsMfaResponse(nextResponse)) {
      const mfaCodeIn = yield {
        code: "SMS_MFA_REQUIRED",
        hint: nextResponse.ChallengeParameters.CODE_DELIVERY_DESTINATION,
      };

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
        session: nextResponse.Session,
        debug,
      });
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
