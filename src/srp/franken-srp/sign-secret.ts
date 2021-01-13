import { signSha256Hmac } from "../../crypto";

import { hexToUint8, uint8ToB64, abufToUint8 } from "../../util";

export const signSecret = async (
  secret: Uint8Array,
  key: string | Uint8Array
): Promise<string> => {
  const k = typeof key === "string" ? hexToUint8(key) : key;
  const pdk1 = await signSha256Hmac(k, secret);
  const uint8 = abufToUint8(pdk1);
  const b64 = uint8ToB64(uint8);
  return b64;
};
