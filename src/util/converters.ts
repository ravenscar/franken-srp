import { b64Atob, b64Btoa, PlatformTextEncoder } from "../platform";

export const hexToUint8 = (hexString: string) =>
  new Uint8Array(
    (hexString.match(/.{1,2}/g) || []).map((byte) => parseInt(byte, 16))
  );

export const codePointToUint8 = (codePoints: string) =>
  new PlatformTextEncoder().encode(codePoints);

export const abufToUint8 = (buf: ArrayBuffer) => new Uint8Array(buf);

export const uint8ToHex = (uint8: Uint8Array) =>
  Array.prototype.map
    .call(uint8, (x) => `00${x.toString(16)}`.slice(-2))
    .join("");

export const uint8ToB64 = (uint8: Uint8Array) =>
  b64Btoa(String.fromCharCode(...uint8));

export const hexToB64 = (hexString: string) =>
  b64Btoa(String.fromCharCode.apply(null, [...hexToUint8(hexString)]));

export const b64ToUint8 = (b64: string) =>
  new Uint8Array(
    b64Atob(b64)
      .split("")
      .map((c) => c.charCodeAt(0))
  );

export const bigIntToHex = (v: bigint) => v.toString(16);

export const hexToBigInt = (hex: string) => BigInt(`0x${hex}`);
