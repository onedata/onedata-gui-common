import { expect } from 'chai';
import { describe, it } from 'mocha';
import VisualiserSpace from 'onedata-gui-common/utils/workflow-visualiser/visualiser-space';
import { get } from '@ember/object';

describe('Unit | Utility | workflow visualiser/visualiser space', function () {
  it('has undefined "elementBefore" and "elementAfter" on init', function () {
    const interlaneSpace = VisualiserSpace.create();

    expect(get(interlaneSpace, 'elementBefore')).to.be.undefined;
    expect(get(interlaneSpace, 'elementAfter')).to.be.undefined;
  });

  it('has non-empty "id" on init', function () {
    const interlaneSpace = VisualiserSpace.create();

    expect(get(interlaneSpace, 'id')).to.be.not.empty;
  });
});
