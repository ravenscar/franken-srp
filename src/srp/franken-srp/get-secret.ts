import { codePointToUint8, b64ToUint8 } from "../../util";
import * as SRP from "../low-level";
import { TSRPChallengeParameters } from "../../cognito/types";

export const getSecret = ({
  groupId,
  challengeParameters,
  timestamp,
}: {
  groupId: string;
  timestamp: string;
  challengeParameters: TSRPChallengeParameters;
}) => {
  const signBuf = new Uint8Array([
    ...codePointToUint8(groupId),
    ...codePointToUint8(
      challengeParameters.DEVICE_KEY ||
        challengeParameters.USER_ID_FOR_SRP ||
        challengeParameters.USERNAME
    ),
    ...b64ToUint8(challengeParameters.SECRET_BLOCK),
    ...codePointToUint8(timestamp),
  ]);

  return signBuf;
};
