import { signSha256Hmac } from "../../crypto";

import { uint8ToHex, codePointToUint8, abufToUint8 } from "../../util";

export const computeKey = async (message: Uint8Array, key: Uint8Array) => {
  const pdk1 = await signSha256Hmac(key, message);
  const pdk2 = await signSha256Hmac(
    abufToUint8(pdk1),
    codePointToUint8("Caldera Derived Key\u0001")
  );
  const hex = uint8ToHex(abufToUint8(pdk2));
  return hex.slice(0, 32);
};
