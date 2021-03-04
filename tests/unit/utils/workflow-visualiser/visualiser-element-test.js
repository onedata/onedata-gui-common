import { expect } from 'chai';
import { describe, it } from 'mocha';
import VisualiserElement from 'onedata-gui-common/utils/workflow-visualiser/visualiser-element';
import { get } from '@ember/object';

describe('Unit | Utility | workflow visualiser/visualiser element', function () {
  [
    'renderer',
    'mode',
    'type',
    'id',
    'parent',
  ].forEach(propName => {
    it(`has undefined "${propName}"`, function () {
      const element = VisualiserElement.create();

      expect(get(element, 'propName')).to.be.undefined;
    });
  });
});
