import { UserPoolProps } from "@aws-cdk/aws-cognito";

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
