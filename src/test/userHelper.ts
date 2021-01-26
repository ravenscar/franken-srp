import * as userOut from "./test_users_out.json";
import { DEFAULT_PASSWORD } from "./poolSetups";
import { getConfigByName } from "./poolHelper";

type TKeys = keyof typeof userOut;

export const getUserByPool = (name: string) => ({
  username: userOut[getConfigByName(name).pool as TKeys],
  password: DEFAULT_PASSWORD,
});
