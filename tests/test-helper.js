import resolver from './helpers/resolver';
import './helpers/responsive';
import { mocha, afterEach } from 'mocha';
import { setResolver } from 'ember-mocha';

setResolver(resolver);

mocha.setup({
  timeout: 5000,
});

// Remove all passed test reports from DOM if `hidepassed` query param is present
const urlParams = new URLSearchParams(location.search);
if (urlParams.get('hidepassed') !== null) {
  afterEach(function () {
    if (this.currentTest.state === 'passed') {
      document.querySelectorAll('.test.pass').forEach(node => node.remove());
    }
  });
}
