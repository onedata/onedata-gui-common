/**
 * Write app-config.json file that is used to configure app on startup using
 * external file
 *
 * @module utils/write-app-config
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* eslint-env node */

const fs = require('fs');

module.exports = function writeAppConfig(app) {
  const onedataAppConfig = {
    debug: !app.isProduction,
  };
  fs.writeFile(
    'public/app-config.json',
    JSON.stringify(onedataAppConfig),
    function (err) {
      if (err) {
        return console.error('Error on writing app-config.json: ' + err);
      }
    }
  );
}
