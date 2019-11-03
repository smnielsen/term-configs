require('colors');
const fs = require('fs').promises;
const path = require('path');
const inquirer = require('inquirer');

const run = async () => {
  const files = await fs.readdir(path.resolve(__dirname, 'scripts'));

  const modules = files.reduce((memo, filename) => {
    memo[filename] = require(path.resolve(__dirname, 'scripts', filename));
    return memo;
  }, {});

  console.log('>> Running SMN module'.bold);
  console.log('...');

  const { scriptName } = await inquirer.prompt([
    {
      name: 'scriptName',
      type: 'list',
      message: 'Choose your script',
      choices: Object.keys(modules).map(
        name => `${name}: ${modules[name].description}`,
      ),
    },
  ]);

  const script = modules[scriptName.split(':')[0]].script;

  return script();
};

run()
  .then(() => {
    console.log('>> Script ended successfully');
    process.exit();
  })
  .catch(err => {
    console.log(`>> Script error: ${err.message.bold}`.red);
    process.exit();
  });
