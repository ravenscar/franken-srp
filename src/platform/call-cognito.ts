declare var window: any;

import { EventEmitter } from "events";
import { noop, SRPError } from "../util";
import { isNode } from "./detection";

type TCallCognitoParams = {
  endpoint: string;
  headers: Record<string, string>;
  body: string;
  debug?: (trace: any) => void;
};

type TCallCognito = (params: TCallCognitoParams) => Promise<unknown>;

const callCognitoBrowser: TCallCognito = async ({
  endpoint,
  headers,
  body,
  debug = noop,
}) => {
  const response = await window.fetch(endpoint, {
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

const callCognitoNode: TCallCognito = async ({
  endpoint,
  headers,
  body,
  debug,
}) => {
  const hostnameMatch = endpoint.match(/^https:\/\/([^/]*)\/?$/);
  const hostname = hostnameMatch && hostnameMatch[1];

  if (!hostname) {
    throw new SRPError(
      `can't determine hostname from ${endpoint}`,
      500,
      "Fetch",
      {}
    );
  }

  const options = {
    hostname,
    headers,
    port: 443,
    path: "/",
    method: "POST",
  };

  const https = __non_webpack_require__("https");

  return new Promise<unknown>((resolve, reject) => {
    let responseCode: number;
    let responseData = "";

    const req = https.request(
      options,
      (im: EventEmitter & { statusCode?: number }) => {
        if (im.statusCode) {
          responseCode = im.statusCode;
        }

        im.on("data", (d) => {
          responseData = responseData + d;
        });

        im.on("end", () => {
          try {
            const parsed = JSON.parse(responseData);
            if (responseCode && responseCode >= 200 && responseCode < 300) {
              resolve(parsed);
            }
            reject(
              new SRPError(parsed?.message, responseCode, "Fetch", {
                responseData,
              })
            );
          } catch (e) {
            reject(
              new SRPError(`error parsing response`, responseCode, "Fetch", {
                responseData,
              })
            );
          }
        });
      }
    );

    req.on("error", (error: any) => {
      reject(
        new SRPError(`error calling cognito`, responseCode, "Fetch", error)
      );
    });

    req.write(body);
    req.end();
  });
};

export const callCognito: TCallCognito = isNode
  ? callCognitoNode
  : callCognitoBrowser;
