import { expect } from 'chai';
import { describe, it } from 'mocha';
import { localSelector } from 'onedata-gui-common/helpers/local-selector';

describe('Unit | Helper | local selector', function () {
  it('generates jQuery selector that find element in current component', function () {
    const result = localSelector(['some-id', '.my-class']);
    expect(result).to.be.equal('#some-id .my-class');
  });
});
