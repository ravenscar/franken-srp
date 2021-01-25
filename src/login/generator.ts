import {
  confirmDevice,
  initiateUserSRPAuth,
  respondSoftwareTokenMfa,
} from "../cognito";
import {
  guardAuthenticationResultResponse,
  guardDeviceChallengeResponse,
  guardSoftwareTokenMfaResponse,
} from "../cognito/types";
import {
  TCognitoAuthenticationResultResponse,
  TAuthResponse,
} from "../cognito/types/authentication-result";
import { makeSrpSession } from "../srp";
import { bigIntToHex } from "../util";
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
}: TSrpLoginParams): TSrpLoginResponse {
  const returnTokens = async ({
    AuthenticationResult: cognitoRes,
  }: TCognitoAuthenticationResultResponse): Promise<TAuthStep> => {
    const authResponse: TAuthResponse = {
      tokens: {
        accessToken: cognitoRes.AccessToken,
        idToken: cognitoRes.IdToken,
        refreshToken: cognitoRes.RefreshToken,
        tokenType: cognitoRes.TokenType,
        expiresIn: cognitoRes.ExpiresIn,
      },
      newDevice: !cognitoRes.NewDeviceMetadata
        ? undefined
        : {
            key: cognitoRes.NewDeviceMetadata.DeviceKey,
            groupKey: cognitoRes.NewDeviceMetadata.DeviceGroupKey,
          },
    };

    if (autoConfirmDevice && authResponse.newDevice) {
      const newDevice = await confirmDevice({
        region,
        accessToken: authResponse.tokens.accessToken,
        deviceKey: authResponse.newDevice.key,
        deviceGroupKey: authResponse.newDevice.groupKey,
      });
      authResponse.newDevice.password = newDevice.devicePassword;
    }

    return {
      code: "TOKENS",
      response: authResponse,
    };
  };

  try {
    const { a, A } = await makeSrpSession();
    const responseA = await initiateUserSRPAuth({
      region,
      clientId,
      username,
      deviceKey: device?.key,
      srpA: bigIntToHex(A),
    });

    let nextResponse = await verifySrp({
      region,
      userPoolId,
      clientId,
      password,
      a,
      challengeName: responseA.ChallengeName,
      challengeParameters: responseA.ChallengeParameters,
      deviceKey: device?.key,
      deviceGroupKey: device?.groupKey,
    });

    if (guardAuthenticationResultResponse(nextResponse)) {
      return returnTokens(nextResponse);
    }

    if (guardSoftwareTokenMfaResponse(nextResponse)) {
      const mfaCodeIn = yield { code: "SOFTWARE_MFA_REQUIRED" };

      if (typeof mfaCodeIn !== "string") {
        throw new Error("Invalid MFA Code");
      }

      const mfaCode = mfaCodeIn.match(/^[0-9]+$/)?.[0];

      if (!mfaCode || mfaCode.length !== 6) {
        throw new Error(`Expected 6 digit MFA code, received: ${mfaCodeIn}`);
      }

      nextResponse = await respondSoftwareTokenMfa({
        region,
        clientId,
        challengeResponses: {
          mfaCode,
          username: responseA.ChallengeParameters.USERNAME,
        },
        session: nextResponse.Session,
      });
    }

    if (guardDeviceChallengeResponse(nextResponse)) {
      if (!device) {
        throw new Error("missing deviceParams");
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
      });
    }

    return returnTokens(nextResponse);
  } catch (error) {
    return {
      error,
      code: "ERROR",
    };
  }
}
