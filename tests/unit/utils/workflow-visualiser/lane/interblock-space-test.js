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
});
