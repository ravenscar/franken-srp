export const stripPoolRegion = (userPoolId: string) => {
  const poolWithoutRegion = userPoolId.split("_")[1];

  if (!poolWithoutRegion) {
    throw new Error(`can't get regionless pool id from ${userPoolId}`);
  }

  return poolWithoutRegion;
};
