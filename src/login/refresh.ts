import { initiateRefreshToken } from "../cognito";
import { TDeviceParams, TUserPoolParams } from "../cognito/types";

export const loginWithRefreshToken = async (
  poolParams: TUserPoolParams,
  { refreshToken }: { refreshToken: string },
  deviceParams: TDeviceParams | undefined
) =>
  initiateRefreshToken({
    REGION: poolParams.REGION,
    CLIENT_ID: poolParams.CLIENT_ID,
    DEVICE_KEY: deviceParams?.key,
    REFRESH_TOKEN: refreshToken,
  });
