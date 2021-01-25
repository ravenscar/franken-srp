import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import { CognitoIntegrationStack } from "../lib/cognito-integration-stack";

test("Empty Stack", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new CognitoIntegrationStack(app, "MyCognitoIntegrationStack");
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {},
      },
      MatchStyle.EXACT
    )
  );
});
