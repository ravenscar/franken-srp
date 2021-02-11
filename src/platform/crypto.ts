import { isNode } from "./detection";

declare var window: any;

interface TCryptoKey {
  readonly algorithm: { name: "HMAC" };
  readonly extractable: false;
  readonly type: "private" | "public" | "secret";
  readonly usages: ["sign", "verify"];
}

type TCryptoImportKey = (
  format: "raw",
  keyData: Uint8Array,
  algorithm: { name: "HMAC"; hash: { name: "SHA-256" } },
  extractable: false,
  keyUsages: ["sign", "verify"]
) => Promise<TCryptoKey>;

type TCryptoGetRandomValues = (array: Uint8Array) => Uint8Array;

type TCryptoDigest = (
  algorithm: "SHA-256",
  data: ArrayBuffer
) => Promise<ArrayBuffer>;

type TCryptoSign = (
  algorithm: "HMAC",
  key: TCryptoKey,
  data: ArrayBuffer
) => Promise<ArrayBuffer>;

export const cryptoImportKey: TCryptoImportKey = isNode
  ? async (format, key, alg) => {
      if (
        format === "raw" &&
        alg.name === "HMAC" &&
        alg.hash.name === "SHA-256"
      ) {
        return key;
      }
      throw new Error(
        `unimplemented format ${format} or algorithm ${JSON.stringify(alg)}`
      );
    }
  : window.crypto.subtle.importKey;

export const cryptoGetRandomValues: TCryptoGetRandomValues = isNode
  ? (buffer) => __non_webpack_require__("crypto").randomFillSync(buffer)
  : window.crypto.getRandomValues;

export const cryptoDigest: TCryptoDigest = isNode
  ? async (alg, data) => {
      if (alg === "SHA-256") {
        const hash = __non_webpack_require__("crypto").createHash("sha256");
        hash.update(data);
        return hash.digest();
      }
      throw new Error(`algorithm ${alg} not implemented`);
    }
  : window.crypto.subtle.digest;

export const cryptoSign: TCryptoSign = isNode
  ? async (alg, key, data) => {
      if (alg === "HMAC") {
        const hmac = __non_webpack_require__("crypto").createHmac(
          "sha256",
          key
        );
        hmac.update(data);
        return hmac.digest();
      }
      throw new Error(`unimplemented algorithm ${alg}`);
    }
  : window.crypto.subtle.sign;
