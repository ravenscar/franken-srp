import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import {
  poolSetups,
  TPoolSetup,
  getPoolIdSlug,
  getPoolClientIdSlug,
  getPoolRegionSlug,
} from "../../poolSetups";

const poolDefaults = {
  signInAliases: {
    email: true,
    username: false,
    phone: false,
    preferredUsername: false,
  },
  signInCaseSensitive: false,
  passwordPolicy: {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireDigits: true,
    requireSymbols: true,
    tempPasswordValidity: cdk.Duration.days(7),
  },
  selfSignUpEnabled: false,
  accountRecovery: cognito.AccountRecovery.NONE,
  autoVerify: {
    email: false,
    phone: false,
  },
  removalPolicy: cdk.RemovalPolicy.DESTROY,
};

const clientDefaults = {
  refreshTokenValidity: cdk.Duration.days(365),
  accessTokenValidity: cdk.Duration.hours(1),
  idTokenValidity: cdk.Duration.hours(1),
  generateSecret: false,
  authFlows: {
    adminUserPassword: false,
    custom: false,
    userPassword: false,
    userSrp: true,
  },
  preventUserExistenceErrors: true,
  disableOAuth: true,
  writeAttributes: new cognito.ClientAttributes().withStandardAttributes({
    nickname: true,
  }),
};

const rollPool = (construct: cdk.Stack, setup: TPoolSetup) => {
  const pool = new cognito.UserPool(construct, setup.name, {
    ...poolDefaults,
    ...setup.poolProps,
  });
  const client = new cognito.UserPoolClient(construct, `${setup.name}-client`, {
    ...clientDefaults,
    ...setup.clientProps,
    userPool: pool,
  });

  const cfnUserPool = pool.node.defaultChild as cognito.CfnUserPool;
  for (const k in setup.CfnUserPoolProps) {
    (cfnUserPool as any)[k] = (setup.CfnUserPoolProps as any)[k];
  }

  new cdk.CfnOutput(construct, getPoolIdSlug(setup.name), {
    value: pool.userPoolId,
  });

  new cdk.CfnOutput(construct, getPoolClientIdSlug(setup.name), {
    value: client.userPoolClientId,
  });

  new cdk.CfnOutput(construct, getPoolRegionSlug(setup.name), {
    value: construct.region,
  });
};

export class CognitoIntegrationStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    for (const setup of poolSetups) {
      rollPool(this, setup);
    }
  }
}
