import { signSha256Hmac, getRandomValues } from "../crypto";

import {
  getCognitoTimestamp,
  padHex,
  hexToUint8,
  hexToBigInt,
  uint8ToB64,
  uint8ToHex,
  hexToB64,
  codePointToUint8,
  b64ToUint8,
  abufToUint8,
} from "../util";
import * as SRP from "./low-level";
import { TSRPChallengeParameters } from "../cognito/types";

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

export const computeKey = async (message: Uint8Array, key: Uint8Array) => {
  const pdk1 = await signSha256Hmac(key, message);
  const pdk2 = await signSha256Hmac(
    abufToUint8(pdk1),
    codePointToUint8("Caldera Derived Key\u0001")
  );
  const hex = uint8ToHex(abufToUint8(pdk2));
  return hex.slice(0, 32);
};

export const getSecret = ({
  groupId,
  challengeParameters,
  timestamp,
}: {
  groupId: string;
  timestamp: string;
  challengeParameters: TSRPChallengeParameters;
}) => {
  const signBuf = new Uint8Array([
    ...codePointToUint8(groupId),
    ...codePointToUint8(
      challengeParameters.DEVICE_KEY ||
        challengeParameters.USER_ID_FOR_SRP ||
        challengeParameters.USERNAME
    ),
    ...b64ToUint8(challengeParameters.SECRET_BLOCK),
    ...codePointToUint8(timestamp),
  ]);

  return signBuf;
};

export const calculateClaimSig = async (
  a: bigint,
  groupId: string,
  userId: string,
  password: string,
  challengeParameters: TSRPChallengeParameters
) => {
  const timestamp = getCognitoTimestamp();
  const salt = challengeParameters.SALT;
  const B = hexToBigInt(challengeParameters.SRP_B);
  const A = await SRP.A({ a });
  const u = await SRP.u({ A, B });
  const k = await SRP.k();
  const x = await SRP.x(salt, groupId, userId, password);
  const s = await SRP.S({ u, a, x, B, k });
  const hkdf = await computeKey(hexToUint8(padHex(s)), hexToUint8(padHex(u)));

  const messageBuf = getSecret({ timestamp, challengeParameters, groupId });
  const claimSig = await signSecret(messageBuf, hkdf);

  return { claimSig, timestamp };
};

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
