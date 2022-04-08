import { afterEach } from 'mocha';

export default function handleHidepassed() {
  // Remove all passed test reports from DOM if `hidepassed` query param is present
  const urlParams = new URLSearchParams(location.search);
  if (urlParams.get('hidepassed') !== null) {
    afterEach(function () {
      if (this.currentTest.state === 'passed') {
        document.querySelectorAll('.test.pass').forEach(node => node.remove());
      }
    });
  }
}
