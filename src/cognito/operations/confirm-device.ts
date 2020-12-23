import { makeDeviceVerifier } from "../../srp";
import { hexToB64, padHex } from "../../util";
import { cognitoFetch } from "../cognito-fetch";
import { TDeviceParams } from "../types";

type TConfirmDeviceParams = Omit<TDeviceParams, "password"> & {
  accessToken: string;
  region: string;
  deviceName?: string;
};

export const confirmDevice = async ({
  region,
  accessToken,
  key,
  groupKey,
  deviceName,
}: TConfirmDeviceParams) => {
  const { salt, verifier, password } = await makeDeviceVerifier(groupKey, key);

  await cognitoFetch({
    region,
    operation: "ConfirmDevice",
    args: {
      AccessToken: accessToken,
      DeviceKey: key,
      DeviceName: deviceName || navigator.userAgent,
      DeviceSecretVerifierConfig: {
        Salt: hexToB64(padHex(salt)),
        PasswordVerifier: verifier,
      },
    },
  });

  // TODO: this needs a guard for the response

  return {
    key,
    groupKey,
    password,
  };
};
