require('colors');
const inquirer = require('inquirer');
const puppeteer = require('puppeteer');

const log = (...msg) => console.log(`...${msg[0]}`.blue, ...msg.slice(1));

const login = async (page, { username, password }) => {
  const url = 'https://rebel.netlight.com';

  // First navigate to url
  log(`Logging in using puppeteer to`, url);
  await page.goto(url, { waitUntil: 'networkidle0' });

  log(`Username: ${username}`);
  log(`Password: ****`);
  // paste in username and password
  await page.evaluate(
    (username, password) => {
      document.getElementById('user_login').value = username;
      document.getElementById('user_pass').value = password;
    },
    username,
    password,
  );

  log('Clicking login button...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }),
    page.click('#wp-submit'),
  ]);

  log('Should be logged in', page.url());

  // Let's get the auth cookie
  const cookies = await page.cookies();
  const authCookie = cookies.reduce(
    (str, cookie) => `${str}; ${cookie.name}=${cookie.value}`,
    '',
  );
  log('Got auth cookie', !!authCookie);

  // Let's take a screenshot
  await page.screenshot({ path: 'puppeteer-endgame.png' });

  return authCookie;
};

module.exports = async () => {
  console.log('>> Logging in to Netlight SSO'.bold);
  const opts = await inquirer.prompt([
    {
      name: 'username',
      type: 'input',
      message: 'Username',
      default: 'sini@netlight.com',
    },
    {
      name: 'password',
      type: 'password',
      message: 'Password',
    },
  ]);

  log(`Creating puppeteer`);
  const browser = await puppeteer.launch({
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  return login(page, opts).catch(async err => {
    console.log(`>> (with screenshot) Script error ${err.message}`.red);
    await page.screenshot({ path: 'puppeteer-error.png' });
    await browser.close();
    throw err;
  });
};
