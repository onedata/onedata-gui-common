import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find } from '@ember/test-helpers';
import { replaceEmberAceWithTextarea } from '../../../../../helpers/ember-ace';

describe('Integration | Component | atm workflow/value presenters/integer/raw presenter', function () {
  setupRenderingTest();

  beforeEach(function () {
    replaceEmberAceWithTextarea(this);
  });

  it('has classes "raw-presenter" and "integer-raw-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/integer/raw-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('raw-presenter')
      .and.to.have.class('integer-raw-presenter');
  });

  it('presents passed value', async function () {
    await render(hbs`{{atm-workflow/value-presenters/integer/raw-presenter
      value=123
    }}`);

    expect(find('.raw-presenter textarea')).to.have.value('123');
  });
});
