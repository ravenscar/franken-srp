import { SRPError, noop } from "../../util";
import { cognitoFetch } from "../cognito-fetch";
import { guardInitiateDeviceSrpResponse } from "../types";

type TRespondDeviceSRPAuthParams = {
  region: string;
  clientId: string;
  username: string;
  deviceKey: string;
  srpA: string;
  debug?: (trace: any) => void;
};

export const respondDeviceSRPAuth = async ({
  username,
  region,
  clientId,
  deviceKey,
  srpA,
  debug = noop,
}: TRespondDeviceSRPAuthParams) => {
  const response = await cognitoFetch({
    operation: "RespondToAuthChallenge",
    region: region,
    args: {
      ChallengeName: "DEVICE_SRP_AUTH",
      ClientId: clientId,
      ChallengeResponses: {
        USERNAME: username,
        SRP_A: srpA,
        DEVICE_KEY: deviceKey,
      },
      Session: undefined,
    },
    debug,
  });

  if (!guardInitiateDeviceSrpResponse(response)) {
    throw new SRPError(
      "Unexpected Response",
      500,
      "guardInitiateDeviceSrpResponse",
      { response }
    );
  }

  return response;
};
