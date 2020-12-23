import { TCognitoFetchOptions, TCognitoOperation } from "./types";

export const cognitoFetch = async <O extends TCognitoOperation>({
  operation,
  region,
  args,
}: TCognitoFetchOptions<O>) => {
  const endpoint = `https://cognito-idp.${region}.amazonaws.com/`;

  const headers = {
    "Content-Type": "application/x-amz-json-1.1",
    "X-Amz-Target": `AWSCognitoIdentityProviderService.${operation}`,
    "X-Amz-User-Agent": "amazon",
  };

  console.log(`fetching: ${endpoint}`);
  console.log(
    JSON.stringify(
      {
        headers,
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        body: JSON.stringify(args),
      },
      null,
      2
    )
  );

  const response = await fetch(endpoint, {
    headers,
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    body: JSON.stringify(args),
  });

  if (response.ok) {
    const json = await response.json();
    console.log("response:");
    console.log(JSON.stringify(json, null, 2));
    return json;
  }

  let errorText = `Fetch failed: status: ${response.status} ${response.statusText}`;

  try {
    const json = await response.json();
    errorText = `${errorText}\n${JSON.stringify(json)}`;
  } catch (e) {
    errorText = `${errorText}\n${e?.stack || e?.message || e}`;
  }

  throw new Error(errorText);
};
