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
  | "TEST_DEVICES"
  | "DEVICES_OPTIONAL"
  | "DONT_REMEMBER_DEVICE"
  | "SKIP_REMEMBER_DEVICE";

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
    hints: ["TEST_DEVICES", "DEVICES_OPTIONAL"],
  },
  {
    name: "FitOptionalDevicesSkipRemembered",
    poolProps: {},
    CfnUserPoolProps: {
      deviceConfiguration: {
        deviceOnlyRememberedOnUserPrompt: true,
      },
    },
    clientProps: {},
    hints: ["TEST_DEVICES", "DEVICES_OPTIONAL", "SKIP_REMEMBER_DEVICE"],
  },
  {
    name: "FitOptionalDevicesNotRemembered",
    poolProps: {},
    CfnUserPoolProps: {
      deviceConfiguration: {
        deviceOnlyRememberedOnUserPrompt: true,
      },
    },
    clientProps: {},
    hints: ["TEST_DEVICES", "DEVICES_OPTIONAL", "DONT_REMEMBER_DEVICE"],
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
    hints: ["TEST_DEVICES"],
  },
  {
    name: "FitOptionalDevicesAndMfa",
    poolProps: {
      mfa: Mfa.OPTIONAL,
      mfaSecondFactor: { sms: false, otp: true },
    },
    CfnUserPoolProps: {
      deviceConfiguration: {
        deviceOnlyRememberedOnUserPrompt: true,
      },
    },
    clientProps: {},
    hints: ["TEST_DEVICES", "DEVICES_OPTIONAL", "MFA_ENABLED"],
  },
  {
    name: "FitRememberDevicesAndMfa",
    poolProps: {
      mfa: Mfa.OPTIONAL,
      mfaSecondFactor: { sms: false, otp: true },
    },
    CfnUserPoolProps: {
      deviceConfiguration: {
        deviceOnlyRememberedOnUserPrompt: false,
      },
    },
    clientProps: {},
    hints: ["TEST_DEVICES", "MFA_ENABLED"],
  },
];
