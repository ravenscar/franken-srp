import { UserPoolProps } from "@aws-cdk/aws-cognito";

export const USER_POOL_ID_SLUG = "UserPoolId";
export const USER_POOL_REGION_SLUG = "UserPoolRegion";
export const USER_POOL_CLIENT_ID_SLUG = "UserPoolClientId";

export const DEFAULT_PASSWORD = "@Sdf1234"; // this is not secret squirrel

export type TPoolSetup = {
  name: string;
  props: UserPoolProps;
};

export const poolSetups: TPoolSetup[] = [
  {
    name: "frankenInttestA",
    props: {},
  },
];
