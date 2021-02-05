import { makeDeviceVerifier } from "../../srp";
import { hexToB64, padHex, noop } from "../../util";
import { cognitoFetch } from "../cognito-fetch";

type TConfirmDeviceParams = {
  accessToken: string;
  region: string;
  deviceName?: string;
  deviceKey: string;
  deviceGroupKey: string;
  debug?: (trace: any) => void;
};

export const confirmDevice = async ({
  region,
  accessToken,
  deviceKey,
  deviceGroupKey,
  deviceName,
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
    confirmed: true,
    userConfirmationNecessary: rawResult.UserConfirmationNecessary,
  };
};
