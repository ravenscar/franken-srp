import { isNode } from "./detection";

declare var window: any;

type TB64Atob = (data: string) => string;
type TB64Btoa = (data: string) => string;

export const b64Atob: TB64Atob = isNode
  ? (b64Encoded) => Buffer.from(b64Encoded, "base64").toString("binary")
  : window.atob;

export const b64Btoa: TB64Btoa = isNode
  ? (str) => Buffer.from(str, "binary").toString("base64")
  : window.btoa;
