import {
  UserPoolProps,
  UserPoolClientProps,
  Mfa,
  CfnUserPool,
} from "@aws-cdk/aws-cognito";

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

export type THint =
  | "MFA_ENABLED"
  | "REMEMBER_DEVICES_OPT"
  | "REMEMBER_DEVICES_YES";

export type TPoolSetup = {
  name: string;
  poolProps: UserPoolProps;
  clientProps: TClientPropsWithoutUserpool;
  CfnUserPoolProps: Partial<CfnUserPool>;
  hints: THint[];
};

export const poolSetups: TPoolSetup[] = [
  {
    name: "FitVanilla",
    poolProps: {},
    clientProps: {},
    CfnUserPoolProps: {},
    hints: [],
  },
  {
    name: "FitMfaOptionalAndOff",
    poolProps: {
      mfa: Mfa.OPTIONAL,
      mfaSecondFactor: { sms: false, otp: true },
    },
    CfnUserPoolProps: {},
    clientProps: {},
    hints: [],
  },
  {
    name: "FitMfaOptionalAndOn",
    poolProps: {
      mfa: Mfa.OPTIONAL,
      mfaSecondFactor: { sms: false, otp: true },
    },
    CfnUserPoolProps: {},
    clientProps: {},
    hints: ["MFA_ENABLED"],
  },
  {
    name: "FitOptionalDevices",
    poolProps: {},
    CfnUserPoolProps: {
      deviceConfiguration: {
        deviceOnlyRememberedOnUserPrompt: true,
      },
    },
    clientProps: {},
    hints: ["REMEMBER_DEVICES_OPT"],
  },
  {
    name: "FitRememberDevices",
    poolProps: {},
    CfnUserPoolProps: {
      deviceConfiguration: {
        deviceOnlyRememberedOnUserPrompt: false,
      },
    },
    clientProps: {},
    hints: ["REMEMBER_DEVICES_YES"],
  },
];
