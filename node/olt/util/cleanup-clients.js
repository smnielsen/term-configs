async function deleteClients(clients) {
  const getToken = () => {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        url:
          'http://localhost:7000/v1/id/auth/realms/master/protocol/openid-connect/token',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        form: {
          client_id: 'admin-cli',
          grant_type: 'password',
          username: 'admin',
          password: adminPass,
        },
      };

      request(options, (error, response, body) => {
        if (error) {
          return reject(new Error('Error get token', error));
        }

        const accessToken = JSON.parse(body).access_token;
        return resolve(accessToken);
      });
    });
  };

  const fetchClient = ({ id, token }) => {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'GET',
        url: `http://localhost:7000/v1/id/auth/admin/realms/olt/clients/${id}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${token}`,
        },
      };

      request(options, (error, response, body) => {
        if (error) {
          return reject(new Error(`Error get client ${id}`, error));
        }

        if (response.statusCode > 299) {
          return reject(
            new Error(`(GET) ${response.statusCode}:${response.statusMessage}`),
          );
        }

        return resolve(JSON.parse(body));
      });
    });
  };

  const deleteClient = ({ id, token }) => {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'DELETE',
        url: `http://localhost:7000/v1/id/auth/admin/realms/olt/clients/${id}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${token}`,
        },
      };

      request(options, (error, response, body) => {
        if (error) {
          return reject(new Error(`Error delete client ${id}`, error));
        }

        if (response.statusCode > 299) {
          return reject(
            new Error(
              `(DELETE) ${response.statusCode}:${response.statusMessage}`,
            ),
          );
        }

        return resolve(body);
      });
    });
  };

  const run = async ({ id, type, appName }, index) => {
    return (
      new Promise(resolve => {
        log(`${index}: Deleting "${type}" - ${id} (APP: ${appName})...`);
        resolve();
      })
        // .then(getToken)
        // .then(token => fetchClient({ id, token }))
        .then(getToken)
        .then(token => {
          return deleteClient({ id, token });
        })
        .then(() => {
          log(`${index} ==> Successfully deleted client!`.green);
          return null;
        })
        .catch(err => {
          log(`${index} # Could not delete cause ${err.message}`.red);
          return {
            error: err.message,
            errStack: err,
            clientId: id,
          };
        })
    );
  };

  return Promise.all(
    clients.map((client, index) => limit(() => run(client, index))),
  );
}
