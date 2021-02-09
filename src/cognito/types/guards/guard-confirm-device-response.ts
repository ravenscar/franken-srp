export type TConfirmDeviceResponse = { UserConfirmationNecessary: boolean };

export const guardConfirmDeviceResponse = (
  thing: any
): thing is TConfirmDeviceResponse => {
  if (
    typeof thing === "object" &&
    (thing.UserConfirmationNecessary === true ||
      thing.UserConfirmationNecessary === false)
  ) {
    return true;
  }
  return false;
};
