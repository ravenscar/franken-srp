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
  | "SKIP_REMEMBER_DEVICE"
  | "SKIP_MFA_REMEMBERED"
  | "RESET_PW_NEEDED";

export type TPoolSetup = {
  name: string;
  poolProps: UserPoolProps;
  clientProps: TClientPropsWithoutUserpool;
  CfnUserPoolProps: Partial<CfnUserPool>;
  hints: THint[];
};

export const TEMP_PASSWORD = "!Passw0rd";

export const poolSetups: TPoolSetup[] = [
  {
    name: "FitVanilla",
    poolProps: {},
    clientProps: {},
    CfnUserPoolProps: {},
    hints: [],
  },
  {
    name: "FitChangePass",
    poolProps: {},
    clientProps: {},
    CfnUserPoolProps: {},
    hints: ["RESET_PW_NEEDED"],
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
    name: "FitMfaOptionalAndOnChangePass",
    poolProps: {
      mfa: Mfa.OPTIONAL,
      mfaSecondFactor: { sms: false, otp: true },
    },
    CfnUserPoolProps: {},
    clientProps: {},
    hints: ["MFA_ENABLED", "RESET_PW_NEEDED"],
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
    name: "FitRememberDevicesChangePass",
    poolProps: {},
    CfnUserPoolProps: {
      deviceConfiguration: {
        deviceOnlyRememberedOnUserPrompt: false,
      },
    },
    clientProps: {},
    hints: ["TEST_DEVICES", "RESET_PW_NEEDED"],
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
  {
    name: "FitRememberDevicesAndMfaChangePass",
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
    hints: ["TEST_DEVICES", "MFA_ENABLED", "RESET_PW_NEEDED"],
  },
  {
    name: "FitOptionalDevicesAndMfaNotRememberedSkipKnown",
    poolProps: {
      mfa: Mfa.OPTIONAL,
      mfaSecondFactor: { sms: false, otp: true },
    },
    CfnUserPoolProps: {
      deviceConfiguration: {
        deviceOnlyRememberedOnUserPrompt: true,
        challengeRequiredOnNewDevice: true,
      },
    },
    clientProps: {},
    hints: [
      "TEST_DEVICES",
      "DEVICES_OPTIONAL",
      "DONT_REMEMBER_DEVICE",
      "SKIP_MFA_REMEMBERED",
    ],
  },
  {
    name: "FitOptionalDevicesAndMfaSkipRememberedSkipKnown",
    poolProps: {
      mfa: Mfa.OPTIONAL,
      mfaSecondFactor: { sms: false, otp: true },
    },
    CfnUserPoolProps: {
      deviceConfiguration: {
        deviceOnlyRememberedOnUserPrompt: true,
        challengeRequiredOnNewDevice: true,
      },
    },
    clientProps: {},
    hints: [
      "TEST_DEVICES",
      "DEVICES_OPTIONAL",
      "SKIP_REMEMBER_DEVICE",
      "SKIP_MFA_REMEMBERED",
    ],
  },
  {
    name: "FitOptionalDevicesAndMfaSkipKnown",
    poolProps: {
      mfa: Mfa.OPTIONAL,
      mfaSecondFactor: { sms: false, otp: true },
    },
    CfnUserPoolProps: {
      deviceConfiguration: {
        deviceOnlyRememberedOnUserPrompt: true,
        challengeRequiredOnNewDevice: true,
      },
    },
    clientProps: {},
    hints: [
      "TEST_DEVICES",
      "DEVICES_OPTIONAL",
      "MFA_ENABLED",
      "SKIP_MFA_REMEMBERED",
    ],
  },
  {
    name: "FitRememberDevicesAndMfaSkipKnown",
    poolProps: {
      mfa: Mfa.OPTIONAL,
      mfaSecondFactor: { sms: false, otp: true },
    },
    CfnUserPoolProps: {
      deviceConfiguration: {
        deviceOnlyRememberedOnUserPrompt: false,
        challengeRequiredOnNewDevice: true,
      },
    },
    clientProps: {},
    hints: ["TEST_DEVICES", "MFA_ENABLED", "SKIP_MFA_REMEMBERED"],
  },
];
