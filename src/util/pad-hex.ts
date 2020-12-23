import { bigIntToHex } from "./converters";

export const padHex = (input: bigint | string) => {
  const h = typeof input === "string" ? input : bigIntToHex(input);
  return h.length % 2 === 1
    ? `0${h}`
    : "89ABCDEFabcdef".indexOf(h[0]) !== -1
    ? `00${h}`
    : h;
};
