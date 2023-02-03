import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find } from '@ember/test-helpers';
import { replaceEmberAceWithTextarea } from '../../../../../helpers/ember-ace';

describe('Integration | Component | atm workflow/value presenters/dataset/raw presenter', function () {
  setupRenderingTest();

  beforeEach(function () {
    replaceEmberAceWithTextarea(this);
  });

  it('has classes "raw-presenter" and "dataset-raw-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/dataset/raw-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('raw-presenter')
      .and.to.have.class('dataset-raw-presenter');
  });

  it('presents passed value', async function () {
    this.set('value', { datasetId: 'abc', rootFilePath: '/spc1/abc' });
    await render(hbs`{{atm-workflow/value-presenters/dataset/raw-presenter
      value=value
    }}`);

    const expectedValue = `{
  "datasetId": "abc",
  "rootFilePath": "/spc1/abc"
}`;
    expect(find('.raw-presenter textarea')).to.have.value(expectedValue);
  });
});
