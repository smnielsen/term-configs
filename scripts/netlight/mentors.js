require('colors');
const assert = require('assert');
const path = require('path');
const fs = require('fs').promises;

const log = (...msg) => {
  console.log(...msg);
};

const LEVELS = {
  A: 0,
  AC: 1,
  C: 2,
  SrC: 3,
  AM: 4,
  M: 5,
  SrM: 6,
  P: 7,
};

async function main() {
  const city = process.argv[2];
  assert(city, 'Please define city as first parameter');
  log('# Checking mentors in', city.blue.bold);

  // Read input
  const input = path.resolve(
    __dirname,
    `input-mentors-${city.toLowerCase()}.json`,
  );
  const res = await fs.readFile(input);
  const data = JSON.parse(res).data;

  // Map data to persons
  // prettier-ignore
  let netlighters = data.reduce((persons, [id, email, mentor, level, doing, link, office, fullName, phoneNumber, { "0": imageUrl }]) => {
    return [
      ...persons,
      {
        id, fullName, email, office, level, mentor, doing, link, imageUrl, phoneNumber
      }
    ]
  }, []);

  // Map Mentors (just copy them)
  netlighters = netlighters.map(({ mentor, ...rest }) => {
    let mentorData = netlighters.find(({ fullName }) => fullName === mentor);
    if (!mentorData) {
      // log(`Missing mentor data for ${rest.fullName}`.yellow);
      mentorData = {
        fullName: 'unknown',
        office: 'unknown',
      };
    }
    return {
      ...rest,
      mentor: mentorData,
    };
  });
  // Verify data, print me
  // log(`Myself`, netlighters.find(nl => nl.fullName === 'Simon Nielsen'));

  // Filter city
  const cityNl = netlighters.filter(
    ({ office }) => office.toLowerCase() === city.toLowerCase(),
  );

  // Pretty print all in level order with mentor
  cityNl.sort(({ level: la }, { level: lb }) => {
    return LEVELS[la] < LEVELS[lb] ? -1 : 1;
  });
  const result = cityNl.reduce(
    (split, nler) => {
      const { fullName, level, office, mentor, doing } = nler;
      const msg = `(${level}) ${fullName} has mentor ${mentor.fullName} on ${
        mentor.level
      } in office ${mentor.office}`;
      const sameOffice = mentor.office === office;
      let update = {};
      if (sameOffice) {
        log(`✅ ${msg.green}`);
        update = {
          ...split,
          same: [...split.same, nler],
        };
      } else {
        log(
          LEVELS[mentor.level] < 6
            ? `❌ ${msg.red}`
            : mentor.level
            ? `👵 ${msg}`
            : `⚠️  ${msg.yellow}`,
        );
        update = {
          ...split,
          others: [...split.others, nler],
          countSwitchProposal:
            split.countSwitchProposal + (LEVELS[mentor.level] < 6 ? 1 : 0),
          missing: split.missing + (mentor.level ? 0 : 1),
        };
      }
      return update;
    },
    { same: [], others: [], countSwitchProposal: 0, missing: 0 },
  );
  log('...');
  log(`=> ${result.others.length} in ${city} has mentors in other offices`);
  log(`=>❌ ${result.countSwitchProposal} should switch mentor?`.blue);
  log(`=>⚠️  ${result.missing} is missing a mentor!`.yellow);

  log(`Done`.green);
}

main().catch(err => log(`Failed with\n ${err.message}`.red));
