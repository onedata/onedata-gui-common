/**
 * Common `test-helper` logic that can be used in all projects.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { start, setResolver } from 'ember-mocha';
import { mocha, afterEach } from 'mocha';
import { setApplication } from '@ember/test-helpers';
import resolver from './resolver';
import Application from '../../app';
import config from '../../config/environment';
import { unsuppressRejections } from './suppress-rejections';
import handleHidepassed from '../handle-hidepassed';
import sinon from 'sinon';
import globals from 'onedata-gui-common/utils/globals';
import SyncObserversChecker from './sync-observers-checker';

/**
 * @typedef {Object} TestHelperOptions
 * @property {number} timeout
 */

export default function commonTestHelper(options = {}) {
  mocha.setup({
    timeout: options.timeout ?? 15000,
  });
  setResolver(resolver);
  setApplication(Application.create(config.APP));

  afterEach(unsuppressRejections);
  afterEach(() => sinon.restore());
  afterEach(() => globals.unmock());

  const syncObserversChecker = new SyncObserversChecker();
  afterEach(() => syncObserversChecker.assertEmptySyncObservers());

  handleHidepassed();
  start();

}
