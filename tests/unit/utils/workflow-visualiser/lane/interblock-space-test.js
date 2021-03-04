import { expect } from 'chai';
import { describe, it } from 'mocha';
import InterblockSpace from 'onedata-gui-common/utils/workflow-visualiser/lane/interblock-space';
import { get } from '@ember/object';

describe('Unit | Utility | workflow visualiser/lane/interblock space', function () {
  it('has "renderer" equal to "workflow-visualiser/lane/interblock-space"', function () {
    const interblockSpace = InterblockSpace.create();

    expect(get(interblockSpace, 'renderer'))
      .to.equal('workflow-visualiser/lane/interblock-space');
  });

  it('has "type" equal to "interblockSpace"', function () {
    const interblockSpace = InterblockSpace.create();

    expect(get(interblockSpace, 'type')).to.equal('interblockSpace');
  });

  it('has undefined "elementBefore" and "elementAfter" on init', function () {
    const interblockSpace = InterblockSpace.create();

    expect(get(interblockSpace, 'elementBefore')).to.be.undefined;
    expect(get(interblockSpace, 'elementAfter')).to.be.undefined;
  });

  it('has non-empty "id" on init', function () {
    const interblockSpace = InterblockSpace.create();

    expect(get(interblockSpace, 'id')).to.be.not.empty;
  });
});
