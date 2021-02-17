import { expect } from 'chai';
import { describe, it } from 'mocha';
import validateOnepanelConnection from 'onedata-gui-common/utils/validate-onepanel-connection';

describe('Unit | Utility | validate onepanel connection', function() {
  // Replace this with your real tests.
  it('works', function() {
    let result = validateOnepanelConnection();
    expect(result).to.be.ok;
  });
});
