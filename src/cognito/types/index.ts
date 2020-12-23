export * from "./guards";

type TLookup<O extends string> = Record<O, string>;

export type TUserPoolParams = TLookup<"REGION" | "USER_POOL_ID" | "CLIENT_ID">;
export type TLoginParams = TLookup<"username" | "password">;
export type TDeviceParams = TLookup<"key" | "groupKey" | "password">;
export type TCallParams = TLookup<"USERNAME" | "REGION" | "CLIENT_ID"> &
  Record<"DEVICE_KEY", string | undefined>;
