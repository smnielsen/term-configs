
require('colors');
const jwt = require('jsonwebtoken');
const oauth2 = require('simple-oauth2');

const tokenObject = {
  'refresh_token': process.argv[2],
};

const credentials = {
  
};

const oauth2Client = oauth2.create(credentials);

const run = async () => {
  let accessToken = oauth2Client.accessToken.create(tokenObject);
  // Check if the token is expired. If expired it is refreshed.
  console.log('----CHECKING REFRESH STATE-----');
  console.log(tokenObject);
  console.log('-------------------------------')
  if (accessToken.expired()) {
    try {
      console.log('# Token expired, refreshing...')
      accessToken = await accessToken.refresh();
      return accessToken;
    } catch (err) {
      console.log('Error refreshing access token: '.red.bold, err.message);
      throw new Error(`Failed to refresh token: ${err.message}`)
    }
  }
  return accessToken;
}

run()
  .then(accessToken => {
    console.log('= Successfully refresh token'.green.bold);
    console.log(accessToken);
  });