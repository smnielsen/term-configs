require('colors');
const inquirer = require('inquirer');
const getCookieAuth = require('../../util/get-cookie-auth');
const getColleagues = require('../../util/get-colleagues');
const mentors = require('./mentors');

const run = async () => {
  console.log('>> Running MENTORS module'.bold);

  const authCookie = await getCookieAuth();
  const colleagues = await getColleagues(authCookie);

  console.log(`== ${colleagues.length} colleagues ==`.green.bold);
  const { office } = await inquirer.prompt([
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
  ]);

  return mentors(office, colleagues);
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
