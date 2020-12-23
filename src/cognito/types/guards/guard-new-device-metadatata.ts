export type TNewDeviceMetadata = {
  DeviceKey: string;
  DeviceGroupKey: string;
};

export const guardNewDeviceMetadatata = (
  thing: any
): thing is TNewDeviceMetadata => {
  if (
    typeof thing === "object" &&
    typeof thing.DeviceKey === "string" &&
    typeof thing.DeviceGroupKey === "string"
  ) {
    return true;
  }
  return false;
};
