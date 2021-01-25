import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";

export class CognitoIntegrationStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const poolA = new cognito.UserPool(this, "myuserpool", {
      selfSignUpEnabled: false,
    });

    new cdk.CfnOutput(this, "apiUrl", {
      value: poolA.userPoolId,
    });
  }
}
