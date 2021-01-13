import { getRandomValues } from "../../crypto";

import { padHex, uint8ToB64, uint8ToHex, hexToB64 } from "../../util";
import * as SRP from "../low-level";

export const makeDeviceVerifier = async (groupKey: string, key: string) => {
  const password = uint8ToB64(getRandomValues(40));
  const salt = uint8ToHex(getRandomValues(16));
  const a = await SRP.x(salt, groupKey, key, password);
  const A = await SRP.A({ a });
  const verifier = hexToB64(padHex(A));

  return { salt, verifier, password };
};
export const makeSrpSession = async () => {
  const a = await SRP.aCreate();
  const A = await SRP.A({ a });

  return { a, A };
};
