import { getRandomValues } from "../../crypto";
import {
  padHex,
  modPow,
  hexToBigInt,
  uint8ToHex,
  bigIntToHex,
} from "../../util";

import { N, g } from "./params";
import { hashHex, hashUtf8 } from "./_helpers";

type TAllowedKeys = "u" | "a" | "x" | "B" | "k" | "A";
type TBigIntRecord<T extends TAllowedKeys> = Record<T, bigint>;

export const aCreate = async () => hexToBigInt(uint8ToHex(getRandomValues(32)));

export const A = async ({ a }: TBigIntRecord<"a">) => modPow(g, a, N);

export const k = async () =>
  hexToBigInt(await hashHex(`00${bigIntToHex(N)}0${bigIntToHex(g)}`));

export const u = async ({ A, B }: TBigIntRecord<"A" | "B">) =>
  hexToBigInt(await hashHex(padHex(A) + padHex(B)));

export const S = async ({
  u,
  a,
  x,
  B,
  k,
}: TBigIntRecord<"u" | "a" | "x" | "B" | "k">) =>
  modPow(B - k * modPow(g, x, N), a + u * x, N);

export const x = async (
  salt: string,
  groupId: string,
  userIdForSrp: string,
  password: string
) =>
  hexToBigInt(
    await hashHex(
      padHex(salt) + (await hashUtf8(`${groupId}${userIdForSrp}:${password}`))
    )
  );
