import { makeDeviceVerifier } from "../../srp";
import { hexToB64, padHex } from "../../util";
import { cognitoFetch } from "../cognito-fetch";
import { TDeviceParams } from "../types";

export const confirmDevice = async (
  region: string,
  {
    accessToken,
    key,
    groupKey,
  }: Omit<TDeviceParams, "password"> & { accessToken: string }
) => {
  const { salt, verifier, password } = await makeDeviceVerifier(groupKey, key);

  await cognitoFetch({
    region,
    operation: "ConfirmDevice",
    args: {
      AccessToken: accessToken,
      DeviceKey: key,
      DeviceName: navigator.userAgent,
      DeviceSecretVerifierConfig: {
        Salt: hexToB64(padHex(salt)),
        PasswordVerifier: verifier,
      },
    },
  });

  return {
    key,
    groupKey,
    password,
  };
};
