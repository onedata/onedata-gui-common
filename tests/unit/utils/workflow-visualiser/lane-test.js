import { expect } from 'chai';
import { describe, it } from 'mocha';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import { get } from '@ember/object';

describe('Unit | Utility | workflow visualiser/lane', function () {
  it('has "renderer" equal to "workflow-visualiser/lane"', function () {
    const lane = Lane.create();

    expect(get(lane, 'renderer')).to.equal('workflow-visualiser/lane');
  });

  it('has "type" equal to "lane"', function () {
    const lane = Lane.create();

    expect(get(lane, 'type')).to.equal('lane');
  });

  it('has undefined "name" on init', function () {
    const lane = Lane.create();

    expect(get(lane, 'name')).to.be.undefined;
  });

  it('has an empty array "elements" on init', function () {
    const lane = Lane.create();

    expect(get(lane, 'elements')).to.be.an('array').and.to.have.length(0);
  });

  it('has false "isFirst" and "isLast" on init', function () {
    const lane = Lane.create();

    expect(get(lane, 'isFirst')).to.be.false;
    expect(get(lane, 'isLast')).to.be.false;
  });
});
