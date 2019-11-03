const assert = require('assert');
const axios = require('axios');
module.exports = async authCookie => {
  assert(authCookie, 'Missing authcookie');
  console.log('>> Getting colleagues from API'.bold);

  const url =
    'https://rebel.netlight.com/wp-admin/admin-ajax.php?action=contact_list';

  const res = await axios({
    method: 'get',
    url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: authCookie,
    },
  });

  if (res.status > 299) {
    throw new Error(`Could not get colleagues: ${res.statusText}`);
  }

  return res.data.data;
};
