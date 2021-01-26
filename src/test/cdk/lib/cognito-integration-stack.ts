import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import {
  poolSetups,
  TPoolSetup,
  getPoolIdSlug,
  getPoolClientIdSlug,
  getPoolRegionSlug,
} from "../../poolSetups";

const rollPool = (construct: cdk.Stack, setup: TPoolSetup) => {
  const pool = new cognito.UserPool(construct, setup.name, {});
  const client = new cognito.UserPoolClient(construct, `${setup.name}-client`, {
    userPool: pool,
  });

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
