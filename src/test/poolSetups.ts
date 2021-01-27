import { UserPoolProps, UserPoolClientProps, Mfa } from "@aws-cdk/aws-cognito";

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

export type THint = "MFA_ENABLED";

export type TPoolSetup = {
  name: string;
  poolProps: UserPoolProps;
  clientProps: TClientPropsWithoutUserpool;
  hints: THint[];
};

export const poolSetups: TPoolSetup[] = [
  {
    name: "FitVanilla",
    poolProps: {},
    clientProps: {},
    hints: [],
  },
  {
    name: "FitMfaOptionalAndOff",
    poolProps: {
      mfa: Mfa.OPTIONAL,
      mfaSecondFactor: { sms: false, otp: true },
    },
    clientProps: {},
    hints: [],
  },
  {
    name: "FitMfaOptionalAndOn",
    poolProps: {
      mfa: Mfa.OPTIONAL,
      mfaSecondFactor: { sms: false, otp: true },
    },
    clientProps: {},
    hints: ["MFA_ENABLED"],
  },
];
