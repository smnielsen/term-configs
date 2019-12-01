require('colors');
const assert = require('assert');
const path = require('path');
const fs = require('fs').promises;
const CliTable = require('cli-table');

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

const getColleagues = async colleagues => {
  if (!colleagues || colleagues.length === 0) {
    // Read input
    const input = path.resolve(__dirname, `input-mentors.json`);
    const res = await fs.readFile(input);
    return JSON.parse(res).data;
  }
  return colleagues;
};

async function main(inputColleagues, { sorting: sortArg, office: officeArg } = {}) {
  const mainOffice = officeArg || process.argv[2];
  assert(mainOffice, 'Please define office as first parameter');
  const sorting = sortArg || process.argv[3];
  log('# Checking mentors in', mainOffice.blue.bold);

  const colleagues = await getColleagues(inputColleagues);

  const isInOffice = nler => nler.office.toLowerCase() === mainOffice.toLowerCase();
  // Map data to persons
  // prettier-ignore
  let netlighters = colleagues.reduce((persons, [id, email, mentor, level, doing, link, office, fullName, phoneNumber, { "0": imageUrl }]) => {
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
        office: '',
      };
    }
    return {
      ...rest,
      mentor: mentorData,
    };
  });
  // Verify data, print me
  // log(`Myself`, netlighters.find(nl => nl.fullName === 'Simon Nielsen'));

  // Pretty print sorted by mentor
  const mappedByMentor = netlighters.reduce((memo, { mentor, ...rest }) => {
    if (isInOffice(mentor)) {
      if (!memo[mentor.id]) {
        memo[mentor.id] = [];
      }
      memo[mentor.id].push({
        ...rest,
        mentor,
      });
    }
    return memo;
  }, {});

  Object.keys(mappedByMentor).forEach(mentorId => {
    const mentees = mappedByMentor[mentorId];
    const mentor = mentees[0].mentor;
    log(
      `${mentor.office.toLowerCase() === mainOffice.toLowerCase() ? '✅' : '⚠️'} ${
        mentor.fullName === 'unknown' ? 'No mentor' : mentor.fullName
      } in "${mentor.office}" (${mentees.length} mentees):`.bold,
    );
    mentees.sort(({ level: la }, { level: lb }) => {
      return LEVELS[la] < LEVELS[lb] ? -1 : 1;
    });
    mentees.forEach(nler => {
      const { fullName, level, office, mentor, doing } = nler;
      log(
        `   ${level}: ${
          office === mentor.office ? fullName.green : fullName.yellow
        } in "${office}" as "${doing}"`,
      );
    });
  });

  log('------------');

  // Filter city
  const cityNl = netlighters.filter(
    ({ office }) => office.toLowerCase() === mainOffice.toLowerCase(),
  );
  // Pretty print all in level order with mentor

  /**
   * Time to Print
   */
  const table = new CliTable({
    head: ['', 'Level'.blue.bold, 'Name'.blue.bold, 'Role'.blue.bold, 'Mentor'.blue.bold, 'Mentor-Office'.blue.bold]
  , colWidths: [7, 7, 30, 15, 30, 15]
  });

  const sorts = {
    'level': ({ level: la }, { level: lb }) => {
      return LEVELS[la] < LEVELS[lb] ? -1 : 1;
    },
    'match': ({ office: oa, level: la, mentor: ma }, { office: ob, level: lb, mentor: mb }) => {
      if (ma.office === oa) {
        return 1
      }
      if (mb.office === ob) {
        return -1
      }
      if (LEVELS[ma.level] < 6) {        
        if (LEVELS[mb.level] < 6) {
          return LEVELS[la] < LEVELS[lb] ? -1 : 1
        }
        return -1
      }
      if (LEVELS[mb.level] < 6) {
        if (LEVELS[ma.level] < 6) {
          return LEVELS[la] < LEVELS[lb] ? -1 : 1
        }
        return 1
      }
      return LEVELS[la] < LEVELS[lb] ? -1 : 1
    },
  }

  cityNl.sort(sorts[sorting] || sorts.level);
  const result = cityNl.reduce(
    (split, nler) => {
      const { fullName, level, office, mentor, doing } = nler;
      const sameOffice = mentor.office === office;
      let update = {};
      let tableData = []
      if (sameOffice) {
        tableData.push()
        table.push([
          'OK'.green.bold,
          level,
          fullName,
          doing,
          mentor.fullName,
          mentor.office
        ])
        update = {
          ...split,
          same: [...split.same, nler],
        };
      } else {
        let color = LEVELS[mentor.level] < 6 ? '$'.red.bold : '$'.yellow.bold
        table.push([
          LEVELS[mentor.level] < 6 ? 'NO'.red.bold : 'MAYBE'.yellow.bold,
          color.replace('$', level),
          color.replace('$', fullName),
          color.replace('$', doing),
          color.replace('$', mentor.fullName),
          color.replace('$', mentor.office),
        ])
        tableData.push()
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
  log(table.toString())
  log('...');
  log(`=> ${result.others.length} in ${mainOffice} has mentors in other offices`);
  log(`=>❌ ${result.countSwitchProposal} should switch mentor?`.blue);
  log(`=>⚠️  ${result.missing} is missing a mentor!`.yellow);


  log(`Done`.green);
}

module.exports = main;
