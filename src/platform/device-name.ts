import { isNode } from "./detection";

declare var window: any;

type TGetDeviceName = () => string;

export const getDeviceName: TGetDeviceName = () =>
  isNode ? `NODEJS: ${process.title}` : window.navigator.userAgent;
