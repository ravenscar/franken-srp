import { UserPoolProps, UserPoolClientProps } from "@aws-cdk/aws-cognito";

type TClientPropsWithoutUserpool = Omit<UserPoolClientProps, "userPool">;

const USER_POOL_ID_SLUG = "UserPoolId";
const USER_POOL_REGION_SLUG = "UserPoolRegion";
const USER_POOL_CLIENT_ID_SLUG = "UserPoolClientId";

export const DEFAULT_PASSWORD = "@Sdf1234"; // this is not secret squirrel

export const getPoolIdSlug = (name: string) => `${name}${USER_POOL_ID_SLUG}`;
export const getPoolRegionSlug = (name: string) =>
  `${name}${USER_POOL_REGION_SLUG}`;
export const getPoolClientIdSlug = (name: string) =>
  `${name}${USER_POOL_CLIENT_ID_SLUG}`;

export type TPoolSetup = {
  name: string;
  poolProps: UserPoolProps;
  clientProps: TClientPropsWithoutUserpool;
};

export const poolSetups: TPoolSetup[] = [
  {
    name: "frankenInttestA",
    poolProps: {},
    clientProps: {},
  },
];
