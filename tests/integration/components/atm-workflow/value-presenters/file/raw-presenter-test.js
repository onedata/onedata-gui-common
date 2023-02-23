import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find } from '@ember/test-helpers';
import { replaceEmberAceWithTextarea } from '../../../../../helpers/ember-ace';

describe('Integration | Component | atm-workflow/value-presenters/file/raw-presenter', function () {
  setupRenderingTest();

  beforeEach(function () {
    replaceEmberAceWithTextarea(this);
  });

  it('has classes "raw-presenter" and "file-raw-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/file/raw-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('raw-presenter')
      .and.to.have.class('file-raw-presenter');
  });

  it('presents passed value', async function () {
    this.set('value', { file_id: 'abc', name: 'file1.txt' });
    await render(hbs`{{atm-workflow/value-presenters/file/raw-presenter
      value=value
    }}`);

    const expectedValue = `{
  "file_id": "abc",
  "name": "file1.txt"
}`;
    expect(find('.raw-presenter textarea')).to.have.value(expectedValue);
  });
});
