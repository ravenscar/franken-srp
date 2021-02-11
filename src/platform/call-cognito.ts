declare var window: any;

import { noop, SRPError } from "../util";
import { isNode } from "./detection";

type TCallCognitoParams = {
  endpoint: string;
  headers: Record<string, string>;
  body: string;
  debug?: (trace: any) => void;
};

type TCallCognito = (params: TCallCognitoParams) => Promise<unknown>;

export const callCognito: TCallCognito = async ({
  endpoint,
  headers,
  body,
  debug = noop,
}) => {
  const fetchInternal = isNode
    ? __non_webpack_require__("node-fetch")
    : window.fetch;

  const response = await fetchInternal(endpoint, {
    headers,
    body,
    method: "POST",
    mode: "cors",
    cache: "no-cache",
  });

  if (response.ok) {
    const jsonResponse: unknown = await response.json();
    debug({ jsonResponse });

    return jsonResponse;
  }

  let errorText = response.statusText;
  let errorDetail = {};

  try {
    const json = await response.json();
    errorDetail = json;
    errorText = json.message || errorText;
  } catch (e) {
    errorDetail = e;
  }

  throw new SRPError(errorText, response.status, "Fetch", errorDetail);
};
