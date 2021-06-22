import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import VisualiserElement from 'onedata-gui-common/utils/workflow-visualiser/visualiser-element';

describe('Integration | Component | workflow visualiser/visualiser element', function () {
  setupComponentTest('workflow-visualiser/visualiser-element', {
    integration: true,
  });

  it('has class "workflow-visualiser-element', function () {
    this.render(hbs `{{workflow-visualiser/visualiser-element}}`);

    expect(this.$().children()).to.have.length(1);
    expect(this.$().children().eq(0)).to.have.class('workflow-visualiser-element');
  });

  it('has not specified "data-visualiser-element-id" attribute when "visualiserElement" is undefined', function () {
    this.render(hbs `{{workflow-visualiser/visualiser-element}}`);

    expect(this.$('.workflow-visualiser-lane-element'))
      .to.not.have.attr('data-visualiser-element-id');
  });

  it('has specified "data-visualiser-element-id" attribute when "visualiserElement" is specified', function () {
    const elementId = '1234';
    this.set('visualiserElement', VisualiserElement.create({
      id: elementId,
    }));

    this.render(hbs `{{workflow-visualiser/visualiser-element elementModel=visualiserElement}}`);

    expect(this.$('.workflow-visualiser-element'))
      .to.have.attr('data-visualiser-element-id', elementId);
  });

  ['view', 'edit'].forEach(mode => {
    const modeClass = `mode-${mode}`;

    it(`has "${modeClass}" class when in "visualiserElement.mode" is "${mode}"`, function () {
      this.set('visualiserElement', VisualiserElement.create({
        mode,
      }));

      this.render(hbs `{{workflow-visualiser/visualiser-element elementModel=visualiserElement}}`);

      expect(this.$('.workflow-visualiser-element')).to.have.class(modeClass);
    });
  });
});
