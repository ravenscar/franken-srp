import { CognitoIdentityServiceProvider } from "aws-sdk";
import { v4 } from "uuid";

import {
  poolSetups,
  USER_POOL_ID_SLUG,
  USER_POOL_REGION_SLUG,
  USER_POOL_CLIENT_ID_SLUG,
  DEFAULT_PASSWORD,
} from "./cdk/lib/poolSetups";
import * as f from "./cdk/cfn_out.json";

type TKeys = keyof typeof f.CognitoIntegrationStack;

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
    const pool =
      f.CognitoIntegrationStack[`${setup.name}${USER_POOL_ID_SLUG}` as TKeys];
    const region =
      f.CognitoIntegrationStack[
        `${setup.name}${USER_POOL_REGION_SLUG}` as TKeys
      ];
    const client =
      f.CognitoIntegrationStack[
        `${setup.name}${USER_POOL_CLIENT_ID_SLUG}` as TKeys
      ];

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
