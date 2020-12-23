import { makeDeviceVerifier } from "../srp";
import { hexToB64, padHex } from "../util";
import { cognitoFetch } from "./cognito-fetch";
import { TDeviceParams, TUserPoolParams } from "./types";

export const confirmDevice = async (
  poolParams: TUserPoolParams,
  {
    accessToken,
    key,
    groupKey,
  }: Omit<TDeviceParams, "password"> & { accessToken: string }
) => {
  const { salt, verifier, password } = await makeDeviceVerifier(groupKey, key);

  await cognitoFetch({
    operation: "ConfirmDevice",
    region: poolParams.REGION,
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
