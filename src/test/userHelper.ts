import * as userOut from "./test_users_out.json";
import { getConfigByName } from "./poolHelper";

type TKeys = keyof typeof userOut;

type TUserSecrets = { username: string; password: string; secretCode?: string };

export const getUserByPool = (name: string): TUserSecrets =>
  userOut[getConfigByName(name).poolId as TKeys];
