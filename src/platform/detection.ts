declare global {
  const __non_webpack_require__: typeof require;
}

export const isNode = !!(
  typeof process !== "undefined" && process?.versions?.node
);

if (isNode && typeof __non_webpack_require__ === "undefined") {
  (global as any).__non_webpack_require__ = require;
}
