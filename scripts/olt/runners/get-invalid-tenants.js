require('colors');
const path = require('path');
const fs = require('fs').promises;
const yaml = require('js-yaml');
const _ = require('lodash');
const getTenants = require('./list-tenants-data');

const fullLog = [];
const log = (...msg) => {
  fullLog.push(msg);
  console.log(...msg);
};

const hasInvalidData = (tenant, countryCodes = []) => {
  const countryCode = _.get(tenant, 'billingCompany.countryCode');
  const phoneCountryPrefix = _.get(tenant, 'billingContact.phoneCountryPrefix');

  if (countryCode && !countryCodes.includes(countryCode)) {
    log(
      `${tenant.name}`.red,
      `has invalid "billingCompany.countryCode" = ${countryCode}`,
    );
    return {
      tenant,
      invalid: `billingCompany.countryCode: ${countryCode}`,
    };
  }
  if (phoneCountryPrefix && !countryCodes.includes(phoneCountryPrefix)) {
    log(
      `${tenant.name}`.red,
      `has invalid "billingContact.phoneCountryPrefix" = ${phoneCountryPrefix}`,
    );
    return {
      tenant,
      invalid: `billingContact.phoneCountryPrefix: ${phoneCountryPrefix}`,
    };
  }

  return null;
};

async function main() {
  const { tenants } = await getTenants();
  // list valid countries
  const countriesYaml = await fs.readFile(
    path.resolve(__dirname, 'data', 'valid-country-codes.yaml'),
    'utf8',
  );
  const yamlData = yaml.safeLoad(countriesYaml);
  const { countryCodes } = yamlData;

  // Search for invalid tenants
  const invalidTenants = tenants
    .map(tenant => hasInvalidData(tenant, countryCodes))
    .filter(t => t !== null);

  log(`Got ${invalidTenants.length} invalid tenants`.bold);
  return {
    invalidTenants,
    invalidTenantsIds: invalidTenants.map(t => t.tenant.id),
  };
}

if ((require.main = module)) {
  const filename = path.basename(__filename);
  log(`Running CLI for ${filename}`);

  main().then(async output => {
    await fs.writeFile(
      path.resolve(__dirname, 'output', `-${filename}-output.json`),
      JSON.stringify(output),
    );
  });
}

module.exports = main;
