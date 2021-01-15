import { TNewDeviceMetadata } from "../authentication-result";

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
