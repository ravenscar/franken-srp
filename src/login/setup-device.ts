import { confirmDevice } from "../cognito";
import { TNewDeviceMetadata, TDeviceParams } from "../cognito/types";

type TSetupDeviceParams = TNewDeviceMetadata & {
  region: string;
  accessToken: string;
  deviceName?: string;
};

export const setupDevice = async ({
  DeviceKey: key,
  DeviceGroupKey: groupKey,
  region,
  accessToken,
  deviceName,
}: TSetupDeviceParams): Promise<TDeviceParams> =>
  confirmDevice({
    key,
    groupKey,
    region,
    accessToken,
    deviceName,
  });
