export * from "./guards";

type TLookup<O extends string> = Record<O, string>;

export type TUserPoolParams = TLookup<"region" | "userPoolId" | "clientId">;
export type TLoginParams = TLookup<"username" | "password">;
export type TDeviceParams = TLookup<"key" | "groupKey" | "password">;
export type TCallParams = TLookup<"username" | "region" | "clientId"> &
  Record<"deviceKey", string | undefined>;
