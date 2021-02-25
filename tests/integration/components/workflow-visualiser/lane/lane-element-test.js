import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import LaneElement from 'onedata-gui-common/utils/workflow-visualiser/lane/lane-element';

describe('Integration | Component | workflow visualiser/lane/lane-element', function () {
  setupComponentTest('workflow-visualiser/lane/lane element', {
    integration: true,
  });

  it('has class "workflow-visualiser-lane-element', function () {
    this.render(hbs `{{workflow-visualiser/lane/lane-element}}`);

    expect(this.$().children()).to.have.length(1);
    expect(this.$().children().eq(0)).to.have.class('workflow-visualiser-lane-element');
  });

  it('has not specified "data-visualiser-element-id" attribute when "laneElement" is undefined', function () {
    this.render(hbs `{{workflow-visualiser/lane/lane-element}}`);

    expect(this.$('.workflow-visualiser-lane-element'))
      .to.not.have.attr('data-visualiser-element-id');
  });

  it('has specified "data-visualiser-element-id" attribute when "laneElement" is specified', function () {
    const elementId = '1234';
    this.set('laneElement', LaneElement.create({
      id: elementId,
    }));

    this.render(hbs `{{workflow-visualiser/lane/lane-element laneElement=laneElement}}`);

    expect(this.$('.workflow-visualiser-lane-element'))
      .to.have.attr('data-visualiser-element-id', elementId);
  });

  ['view', 'edit'].forEach(mode => {
    const modeClass = `mode-${mode}`;

    it(`has "${modeClass}" class when in "laneElement.mode" is "${mode}"`, function () {
      this.set('laneElement', LaneElement.create({
        mode,
      }));

      this.render(hbs `{{workflow-visualiser/lane/lane-element laneElement=laneElement}}`);

      expect(this.$('.workflow-visualiser-lane-element')).to.have.class(modeClass);
    });
  });
});
