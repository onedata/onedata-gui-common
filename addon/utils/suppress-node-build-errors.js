/**
 * Fixes stopping `ember serve` after any build error. Fix based on
 * ember-cli issue https://github.com/ember-cli/ember-cli/issues/9404.
 * It's already fixed by https://github.com/ember-cli/ember-cli/pull/9987
 * in the 4.8 ember-cli release
 * https://github.com/ember-cli/ember-cli/releases/tag/v4.8.0.
 * TODO: VFS-11893 Stop using this hack.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* eslint-env node */

module.exports = function suppressNodeBuildErrors() {
  process.on('uncaughtException', function (error) {
    console.error(error.stack);
    console.log('Not allowing node to exit after build error.');
  });
};
