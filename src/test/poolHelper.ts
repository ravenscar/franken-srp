import * as cfnOut from "./cdk/cfn_out.json";
import {
  getPoolClientIdSlug,
  getPoolIdSlug,
  getPoolRegionSlug,
} from "./poolSetups";

type TKeys = keyof typeof cfnOut.CognitoIntegrationStack;

export const getConfigByName = (name: string) => ({
  pool: cfnOut.CognitoIntegrationStack[getPoolIdSlug(name) as TKeys],
  region: cfnOut.CognitoIntegrationStack[getPoolRegionSlug(name) as TKeys],
  client: cfnOut.CognitoIntegrationStack[getPoolClientIdSlug(name) as TKeys],
});
