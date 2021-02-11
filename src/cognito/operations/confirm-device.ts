import { getDeviceName } from "../../platform";
import { makeDeviceVerifier } from "../../srp";
import { hexToB64, padHex, noop, SRPError } from "../../util";
import { cognitoFetch } from "../cognito-fetch";
import { guardConfirmDeviceResponse } from "../types";

type TConfirmDeviceParams = {
  accessToken: string;
  region: string;
  deviceName?: string;
  deviceKey: string;
  deviceGroupKey: string;
  autoRememberDevice: "remembered" | "not_remembered" | null;
  debug?: (trace: any) => void;
};

export const confirmDevice = async ({
  region,
  accessToken,
  deviceKey,
  deviceGroupKey,
  deviceName,
  autoRememberDevice,
  debug = noop,
}: TConfirmDeviceParams) => {
  const { salt, verifier, password } = await makeDeviceVerifier(
    deviceGroupKey,
    deviceKey
  );

  const response = await cognitoFetch({
    region,
    operation: "ConfirmDevice",
    args: {
      AccessToken: accessToken,
      DeviceKey: deviceKey,
      DeviceName: deviceName || getDeviceName(),
      DeviceSecretVerifierConfig: {
        Salt: hexToB64(padHex(salt)),
        PasswordVerifier: verifier,
      },
    },
    debug,
  });
  debug({ response });

  if (!guardConfirmDeviceResponse(response)) {
    throw new SRPError(
      "Unexpected Response",
      500,
      "guardConfirmDeviceResponse",
      { response }
    );
  }

  let deviceAutoRemembered: undefined | "not_remembered" | "remembered";

  if (response.UserConfirmationNecessary && autoRememberDevice) {
    const response = await cognitoFetch({
      region,
      operation: "UpdateDeviceStatus",
      args: {
        AccessToken: accessToken,
        DeviceKey: deviceKey,
        DeviceRememberedStatus: autoRememberDevice,
      },
      debug,
    });
    debug({ response });
    // No guard here as docs say no output
    deviceAutoRemembered = autoRememberDevice;
  }

  return {
    deviceKey,
    deviceGroupKey,
    devicePassword: password,
    deviceAutoConfirmed: true,
    deviceAutoRemembered,
    userConfirmationNecessary: deviceAutoRemembered
      ? false
      : response.UserConfirmationNecessary,
  };
};
