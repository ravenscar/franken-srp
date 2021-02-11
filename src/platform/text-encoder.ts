declare var window: any;

import { isNode } from "./detection";

interface TTextEncoder {
  encode(input?: string): Uint8Array;
}

export const PlatformTextEncoder: { new (): TTextEncoder } = isNode
  ? __non_webpack_require__("util").TextEncoder
  : window.TextEncoder.bind(window);
