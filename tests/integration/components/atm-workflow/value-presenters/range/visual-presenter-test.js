import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find } from '@ember/test-helpers';

describe('Integration | Component | atm workflow/value presenters/range/visual presenter', function () {
  setupRenderingTest();

  it('has classes "visual-presenter" and "range-visual-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/range/visual-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('visual-presenter')
      .and.to.have.class('range-visual-presenter');
  });

  it('presents passed value', async function () {
    this.set('value', { start: 2, end: 10, step: 3 });
    await render(hbs`{{atm-workflow/value-presenters/range/visual-presenter
      value=value
    }}`);

    expect(find('.start-property .property-label')).to.have.trimmed.text('Start:');
    expect(find('.start-property .property-value')).to.have.trimmed.text('2');
    expect(find('.end-property .property-label')).to.have.trimmed.text('End:');
    expect(find('.end-property .property-value')).to.have.trimmed.text('10');
    expect(find('.step-property .property-label')).to.have.trimmed.text('Step:');
    expect(find('.step-property .property-value')).to.have.trimmed.text('3');
  });
});
