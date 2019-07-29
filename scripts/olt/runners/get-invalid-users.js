require('colors');
const path = require('path');
const fs = require('fs').promises;
const yaml = require('js-yaml');
const _ = require('lodash');
const { getName } = require('i18n-iso-countries');
const getUsers = require('./list-users-data');

const fullLog = [];
const log = (...msg) => {
  fullLog.push(msg);
  console.log(...msg);
};

const whitelistStrangeCountries = [
  'United Kingdom of Great Britain and Northern Ireland',
];

const hasInvalidData = (user, countryCodes = []) => {
  const countries = _.get(user, 'attributes.country');
  if (!countries) {
    return null;
  }

  let userCountries = countries.filter(
    c => !!c && c !== 'null' && !whitelistStrangeCountries.includes(c),
  );
  const invalids = userCountries.filter(userCountry => {
    const foundIndex = countryCodes.findIndex(
      code => getName(code, 'en') === userCountry,
    );
    if (foundIndex === -1) {
      // reverse lookup
      const userCountryName = getName(userCountry, 'en');
      return (
        countryCodes.findIndex(
          code => getName(code, 'en') === userCountryName,
        ) === -1
      );
    }
    return false;
  });
  if (invalids && invalids.length > 0) {
    log(
      `${user.email}`.red,
      `has invalid`,
      `"attributes.country" = ${invalids.join(':')}`.bold,
    );
    return {
      user,
      invalid: `attributes.country: ${invalids.join(':')}`,
    };
  }

  return null;
};

async function main() {
  // list valid countries
  const countriesYaml = await fs.readFile(
    path.resolve(__dirname, 'data', 'valid-country-codes.yaml'),
    'utf8',
  );
  const yamlData = yaml.safeLoad(countriesYaml);
  const { countryCodes } = yamlData;

  countryCodes.forEach((code, index) => {
    log(`$ ${index}: ${code} -> ${getName(code, 'en')}`);
  });

  const { users } = await getUsers();
  // Search for invalid tenants
  const invalidUsers = users
    .map(user => hasInvalidData(user, countryCodes))
    .filter(u => u !== null);

  log(
    `Got ${invalidUsers.length} invalid users`.bold,
    `of ${users.length} users`,
  );
  return {
    invalidUsers: invalidUsers,
    invalidUserIds: invalidUsers.map(u => u.user.id),
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
