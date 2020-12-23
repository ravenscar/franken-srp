import {
  hexToUint8,
  abufToUint8,
  codePointToUint8,
  uint8ToHex,
} from "../../util";
import { hashSha256 } from "../../crypto";

export const hashHex = async (hex: string) =>
  uint8ToHex(abufToUint8(await hashSha256(hexToUint8(hex))));

export const hashUtf8 = async (utf8: string) =>
  uint8ToHex(abufToUint8(await hashSha256(codePointToUint8(utf8))));
