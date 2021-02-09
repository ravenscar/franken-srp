import { CognitoIdentityServiceProvider } from "aws-sdk";
import { v4 } from "uuid";
import { getTotp } from "minimal-cognito-totp";

require("../../polyfills"); // sigh

import { srpLogin } from "../"; // chicken please meet egg
import { poolSetups } from "./poolSetups";
import { getConfigByName } from "./poolHelper";

const setupMfa = async (...params: Parameters<typeof srpLogin>) => {
  const loginerator = srpLogin(...params);
  const result = await loginerator.next();

  if (!result.done || result.value.code !== "TOKENS") {
    if (result.value.code === "ERROR") {
      console.warn(result.value.error);
    }
    throw new Error(
      `undexpected result in user setup: ${JSON.stringify(result)}`
    );
  }

  const cisp = new CognitoIdentityServiceProvider({
    region: params[0].region,
    accessKeyId: "awsneedsthisforsomereason",
    secretAccessKey: "awsneedsthisforsomereason",
  });

  const accessToken = result.value.response!.tokens.accessToken;

  const associationResult = await cisp
    .associateSoftwareToken({
      AccessToken: accessToken,
    })
    .promise();

  const secretCode = associationResult.SecretCode!;

  const userCode = getTotp(secretCode);

  await cisp
    .verifySoftwareToken({
      UserCode: userCode,
      AccessToken: accessToken,
    })
    .promise();

  await cisp
    .setUserMFAPreference({
      AccessToken: accessToken,
      SoftwareTokenMfaSettings: { Enabled: true, PreferredMfa: true },
    })
    .promise();

  return secretCode;
};

type TUserSecrets = { username: string; password: string; secretCode?: string };

const createUser = async (
  pool: string,
  region: string
): Promise<TUserSecrets> => {
  const cisp = new CognitoIdentityServiceProvider({ region });
  const name = v4();

  await cisp
    .adminCreateUser({
      UserPoolId: pool,
      Username: name,
    })
    .promise();

  const password = `1@U${v4()}`;
  await cisp
    .adminSetUserPassword({
      UserPoolId: pool,
      Username: name,
      Password: password,
      Permanent: true,
    })
    .promise();

  return {
    username: name,
    password: password,
  };
};

const run = async () => {
  const userMappings: Record<string, TUserSecrets> = {};

  for (const setup of poolSetups) {
    const { poolId, region, clientId } = getConfigByName(setup.name);

    if (!poolId || !region || !clientId) {
      throw new Error(
        `missing config for ${setup.name}: ${poolId}, ${region}, ${clientId}`
      );
    }

    const user = await createUser(poolId, region);

    if (setup.hints.includes("MFA_ENABLED")) {
      user.secretCode = await setupMfa({
        region,
        userPoolId: poolId,
        clientId,
        username: user.username,
        password: user.password,
        device: undefined,
        autoConfirmDevice: false,
        autoUserConfirmation: false,
      });
    }

    userMappings[poolId] = user;
  }

  console.log(JSON.stringify(userMappings, null, 2));
};

run().catch((e) => {
  console.error(e);
  process.exit(-1);
});
