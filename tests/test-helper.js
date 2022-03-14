import { start, setResolver } from 'ember-mocha';
import { mocha, afterEach } from 'mocha';
import resolver from './helpers/resolver';
import './helpers/responsive';
import silenceDeprecations from 'onedata-gui-common/utils/silence-deprecations';
import { unsuppressRejections } from './helpers/suppress-rejections';

// TODO: VFS-8903 Remove silenceDeprecations call
silenceDeprecations();

mocha.setup({
  timeout: 5000,
});
setResolver(resolver);

afterEach(unsuppressRejections);

// Remove all passed test reports from DOM if `hidepassed` query param is present
const urlParams = new URLSearchParams(location.search);
if (urlParams.get('hidepassed') !== null) {
  afterEach(function () {
    if (this.currentTest.state === 'passed') {
      document.querySelectorAll('.test.pass').forEach(node => node.remove());
    }
  });
}

start();
