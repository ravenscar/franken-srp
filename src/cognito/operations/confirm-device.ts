import { makeDeviceVerifier } from "../../srp";
import { hexToB64, padHex } from "../../util";
import { cognitoFetch } from "../cognito-fetch";

type TConfirmDeviceParams = {
  accessToken: string;
  region: string;
  deviceName?: string;
  deviceKey: string;
  deviceGroupKey: string;
};

export const confirmDevice = async ({
  region,
  accessToken,
  deviceKey,
  deviceGroupKey,
  deviceName,
}: TConfirmDeviceParams) => {
  const { salt, verifier, password } = await makeDeviceVerifier(
    deviceGroupKey,
    deviceKey
  );

  await cognitoFetch({
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
  });

  // TODO: this needs a guard for the response

  return {
    deviceKey,
    deviceGroupKey,
    devicePassword: password,
  };
};
