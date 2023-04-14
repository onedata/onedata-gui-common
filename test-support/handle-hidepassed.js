import { afterEach } from 'mocha';
import globals from 'onedata-gui-common/utils/globals';

export default function handleHidepassed() {
  // Remove all passed test reports from DOM if `hidepassed` query param is present
  const urlParams = new URLSearchParams(globals.location.search);
  if (urlParams.get('hidepassed') !== null) {
    afterEach(function () {
      if (this.currentTest.state === 'passed') {
        globals.document.querySelectorAll('.test.pass').forEach(node => node.remove());
      }
    });
  }
}
