import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import InterlaneSpace from 'onedata-gui-common/utils/workflow-visualiser/interlane-space';
import VisualiserElement from 'onedata-gui-common/utils/workflow-visualiser/visualiser-element';
import _ from 'lodash';

describe('Integration | Component | workflow visualiser/visualiser space', function () {
  setupComponentTest('workflow-visualiser/visualiser-space', {
    integration: true,
  });

  it('has classes "workflow-visualiser-space" and "workflow-visualiser-element"', function () {
    this.render(hbs `{{workflow-visualiser/visualiser-space}}`);

    expect(this.$().children()).to.have.length(1);
    expect(this.$().children().eq(0))
      .to.have.class('workflow-visualiser-space')
      .and.to.have.class('workflow-visualiser-element');
  });

  ['before', 'after'].forEach(elementSuffix => {
    const siblingName = `element${_.upperFirst(elementSuffix)}`;
    const htmlAttrForSibling = `data-element-${elementSuffix}-id`;

    it(`has not specified "${htmlAttrForSibling}" attribute when "${siblingName}" is undefined`, function () {
      this.set('space', InterlaneSpace.create({
        [siblingName]: undefined,
      }));

      this.render(hbs `{{workflow-visualiser/visualiser-space elementModel=space}}`);

      expect(this.$('.workflow-visualiser-space')).to.not.have.attr(htmlAttrForSibling);
    });

    it(`has specified "${htmlAttrForSibling}" attribute when "${siblingName}" is specified`, function () {
      const elementId = '1234';
      this.set('space', InterlaneSpace.create({
        [siblingName]: VisualiserElement.create({
          id: elementId,
        }),
      }));

      this.render(hbs `{{workflow-visualiser/visualiser-space elementModel=space}}`);

      expect(this.$('.workflow-visualiser-space'))
        .to.have.attr(htmlAttrForSibling, elementId);
    });
  });
});
