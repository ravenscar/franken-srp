var nodeCrypto = require("crypto");
const { TextEncoder: NodeTextEncoder } = require("util");

if (!window.crypto) {
  window.crypto = {
    getRandomValues: (buffer) => {
      return nodeCrypto.randomFillSync(buffer);
    },
    subtle: {
      digest: async (alg, data) => {
        if (alg === "SHA-256") {
          const hash = nodeCrypto.createHash("sha256");
          hash.update(data);
          return hash.digest();
        }
        throw new Error(`algorithm ${alg} not implemented`);
      },
      sign: async (alg, key, data) => {
        if (alg === "HMAC") {
          const hmac = nodeCrypto.createHmac("sha256", key);
          hmac.update(data);
          return hmac.digest();
        }
        throw new Error(`unimplemented algorithm ${alg}`);
      },
      importKey: async (format, key, alg) => {
        if (
          format === "raw" &&
          alg.name === "HMAC" &&
          alg.hash.name === "SHA-256"
        ) {
          return key;
        }
        throw new Error(
          `unimplemented format ${format} or algorithm ${JSON.stringify(alg)}`
        );
      },
    },
  };
}

if (!window.TextEncoder) {
  window.TextEncoder = NodeTextEncoder;
}

window.fetch = require("node-fetch");
