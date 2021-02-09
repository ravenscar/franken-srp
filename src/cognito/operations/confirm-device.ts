import { makeDeviceVerifier } from "../../srp";
import { hexToB64, padHex, noop } from "../../util";
import { cognitoFetch } from "../cognito-fetch";

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

  const rawResult = await cognitoFetch({
    region,
    operation: "ConfirmDevice",
    args: {
      AccessToken: accessToken,
      DeviceKey: deviceKey,
      DeviceName: deviceName || navigator.userAgent,
      DeviceSecretVerifierConfig: {
        Salt: hexToB64(padHex(salt)),
        PasswordVerifier: verifier,
      },
    },
    debug,
  });
  debug({ rawResult });

  // TODO: this needs a guard for the response

  return {
    deviceKey,
    deviceGroupKey,
    devicePassword: password,
    deviceAutoConfirmed: true,
    deviceAutoRemembered: "not_remembered" as const, // not_remembered remembered null
    userConfirmationNecessary: rawResult.UserConfirmationNecessary,
  };
};
