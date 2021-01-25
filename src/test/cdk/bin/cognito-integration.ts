#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { CognitoIntegrationStack } from "../lib/cognito-integration-stack";

const app = new cdk.App();
new CognitoIntegrationStack(app, "CognitoIntegrationStack");
