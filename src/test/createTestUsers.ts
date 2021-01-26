import { CognitoIdentityServiceProvider } from "aws-sdk";
import { v4 } from "uuid";

import { poolSetups, DEFAULT_PASSWORD } from "./poolSetups";
import { getConfigByName } from "./poolHelper";

const createUser = async (pool: string, region: string) => {
  const cisp = new CognitoIdentityServiceProvider({ region });
  const name = v4();

  await cisp
    .adminCreateUser({
      UserPoolId: pool,
      Username: name,
    })
    .promise();

  await cisp
    .adminSetUserPassword({
      UserPoolId: pool,
      Username: name,
      Password: DEFAULT_PASSWORD,
      Permanent: true,
    })
    .promise();

  return {
    username: name,
  };
};

const run = async () => {
  const userMappings: Record<string, string> = {};

  for (const setup of poolSetups) {
    const { pool, region, client } = getConfigByName(setup.name);

    if (!pool || !region || !client) {
      throw new Error(
        `missing config for ${setup.name}: ${pool}, ${region}, ${client}`
      );
    }

    const user = await createUser(pool, region);
    userMappings[pool] = user.username;
  }

  console.log(JSON.stringify(userMappings));
};

run().catch((e) => {
  console.error(e);
  process.exit(-1);
});
