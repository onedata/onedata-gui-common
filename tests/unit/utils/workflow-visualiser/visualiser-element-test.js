import { expect } from 'chai';
import { describe, it } from 'mocha';
import VisualiserElement from 'onedata-gui-common/utils/workflow-visualiser/visualiser-element';
import { get } from '@ember/object';

describe('Unit | Utility | workflow visualiser/visualiser element', function () {
  [
    '__type',
    'renderer',
    'mode',
    'id',
    'parent',
    'actionsFactory',
  ].forEach(propName => {
    it(`has undefined "${propName}"`, function () {
      const element = VisualiserElement.create();

      expect(get(element, propName)).to.be.undefined;
    });
  });

  it('has "objectOrigin" equal to "workflowVisualiser"', function () {
    const element = VisualiserElement.create();

    expect(get(element, 'objectOrigin')).to.equal('workflowVisualiser');
  });
});
