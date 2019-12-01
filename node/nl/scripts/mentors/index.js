require('colors');
const inquirer = require('inquirer');
const path = require('path');
const getColleagues = require('../../util/get-colleagues');
const mentors = require('./mentors');
const CliTable = require('cli-table');

const run = async () => {
  console.log('>> Running MENTORS module'.bold);
  
  const colleagues = await getColleagues();

  console.log(`== ${colleagues.length} colleagues ==`.green.bold);
  const { office, sorting } = await inquirer.prompt([
    {
      name: 'office',
      type: 'list',
      message: 'Choose office',
      choices: [
        'berlin',
        'stockholm',
        'helsinki',
        'hamburg',
        'oslo',
        'munich',
        'copenhagen',
        'frankfurt',
        'zurich',
      ],
    },
    {
      name: 'sorting',
      type: 'list',
      message: 'Choose sorting',
      default: 'level',
      choices: [
        'level',
        'match',
      ],
    },
  ]);

  return mentors(colleagues, { office, sorting });
};

if (require.main === module) {
  run()
    .then(() => {
      console.log('>> Script ended successfully');
      process.exit();
    })
    .catch(err => {
      console.log(`>> Script error ${err.message}`.red);
      process.exit();
    });
}

module.exports = run;
