import {
  getCognitoTimestamp,
  padHex,
  hexToUint8,
  hexToBigInt,
} from "../../util";
import * as SRP from "../low-level";
import { TSRPChallengeParameters } from "../../cognito/types";
import { computeKey } from "./compute-key";
import { getSecret } from "./get-secret";
import { signSecret } from "./sign-secret";

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
