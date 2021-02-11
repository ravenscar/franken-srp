import {
  cryptoDigest,
  cryptoSign,
  cryptoImportKey,
  cryptoGetRandomValues,
} from "../platform/index";

const getCryptoKey = (key: Uint8Array) =>
  cryptoImportKey(
    "raw",
    key,
    {
      name: "HMAC",
      hash: { name: "SHA-256" },
    },
    false,
    ["sign", "verify"]
  );

export const signSha256Hmac = async (
  key: Uint8Array,
  data: ArrayBuffer
): Promise<ArrayBuffer> => cryptoSign("HMAC", await getCryptoKey(key), data);

export const hashSha256 = (data: ArrayBuffer) => cryptoDigest("SHA-256", data);

export const getRandomValues = (sizeBytes: number) =>
  cryptoGetRandomValues(new Uint8Array(sizeBytes));
