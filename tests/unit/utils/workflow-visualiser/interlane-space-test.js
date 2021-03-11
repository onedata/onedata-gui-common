import { expect } from 'chai';
import { describe, it } from 'mocha';
import InterlaneSpace from 'onedata-gui-common/utils/workflow-visualiser/interlane-space';
import { get } from '@ember/object';

describe('Unit | Utility | workflow visualiser/interlane space', function () {
  it('has "renderer" equal to "workflow-visualiser/interlane-space"', function () {
    const interlaneSpace = InterlaneSpace.create();

    expect(get(interlaneSpace, 'renderer'))
      .to.equal('workflow-visualiser/interlane-space');
  });

  it('has "type" equal to "interlaneSpace"', function () {
    const interlaneSpace = InterlaneSpace.create();

    expect(get(interlaneSpace, 'type')).to.equal('interlaneSpace');
  });

  it('has "parent" equal to null', function () {
    const interlaneSpace = InterlaneSpace.create();

    expect(get(interlaneSpace, 'parent')).to.be.null;
  });

  it('has "siblingsType" equal to "lane"', function () {
    const interlaneSpace = InterlaneSpace.create();

    expect(get(interlaneSpace, 'siblingsType')).to.equal('lane');
  });
});
