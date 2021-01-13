import { initiateRefreshToken } from "../cognito";
import { TDeviceParams, TUserPoolParams } from "../cognito/types";

export const refresh = async (
  poolParams: TUserPoolParams,
  { refreshToken }: { refreshToken: string },
  deviceParams: TDeviceParams | undefined
) =>
  initiateRefreshToken({
    region: poolParams.region,
    clientId: poolParams.clientId,
    deviceKey: deviceParams?.key,
    refreshToken: refreshToken,
  });
