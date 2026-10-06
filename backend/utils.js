/**
 * Build a bitmask map of supported distributions and versions.
 */
export const buildDistroBitMap = (supportedDistros) => {
  const distroBitMap = {};
  let bitFlag = 1n;

  for (const distroName of Object.keys(supportedDistros)) {
    const versions = Object.keys(supportedDistros[distroName]).sort();
    for (const version of versions) {
      if (!distroBitMap[distroName]) {
        distroBitMap[distroName] = {};
      }
      distroBitMap[distroName][version] = bitFlag;
      bitFlag *= 2n;
    }
  }

  return distroBitMap;
};

/**
 * Return database table names matching the given search bitmask.
 */
export const getTables = (searchBit, distroBitMap, supportedDistros) => {
  const tables = [];

  for (const distroName of Object.keys(supportedDistros)) {
    const versions = Object.keys(supportedDistros[distroName]).sort();
    for (const version of versions) {
      const bit = distroBitMap[distroName][version];
      if ((bit & BigInt(searchBit)) > 0n) {
        tables.push(supportedDistros[distroName][version]);
      }
    }
  }

  return tables;
};

/**
 * Serialize objects containing BigInt values to JSON-safe form.
 */
export const stringifyBigInts = (obj) => {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};
