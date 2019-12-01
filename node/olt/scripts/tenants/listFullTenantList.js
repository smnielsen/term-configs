const path = require('path');
const fs = require('fs').promises;
const listTenantsData = require('../../util/list-tenants-data');

module.exports = () => {
  return listTenantsData({ excludeProperties: ['payment'] }).then(
    async ({ tenants }) => {
      const output = path.resolve(
        process.cwd(),
        `smn-output-full-tenants.json`,
      );
      await fs.writeFile(output, JSON.stringify({ tenants }));
      let logStr = '';
      tenants.forEach(tenant => {
        logStr += `[${tenant.name}-${tenant.status.code}] Email=${
          tenant.billingContact ? tenant.billingContact.email : 'unknown'
        } (ID=${tenant.id})\n`;
      });
      const logOutput = path.resolve(
        process.cwd(),
        `smn-output-full-tenants.txt`,
      );
      await fs.writeFile(logOutput, logStr);
      console.log(``);
      console.log(`=> Success. Wrote result to:`.green);
      console.log(`   ${output}`);
      console.log(`   ${logOutput}`);
    },
  );
};
