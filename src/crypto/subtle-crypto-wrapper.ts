const getCryptoKey = (key: Uint8Array) =>
  window.crypto.subtle.importKey(
    "raw",
    key,
    {
      name: "HMAC",
      hash: { name: "SHA-256" },
    },
    false,
    ["sign", "verify"]
  );

export const signSha256Hmac = async (key: Uint8Array, data: ArrayBuffer) =>
  window.crypto.subtle.sign("HMAC", await getCryptoKey(key), data);

export const hashSha256 = (data: ArrayBuffer) =>
  window.crypto.subtle.digest("SHA-256", data);

export const getRandomValues = (sizeBytes: number) =>
  window.crypto.getRandomValues(new Uint8Array(sizeBytes));
