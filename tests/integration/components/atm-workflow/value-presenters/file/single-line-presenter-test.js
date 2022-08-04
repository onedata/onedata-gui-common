import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find } from '@ember/test-helpers';

describe('Integration | Component | atm workflow/value presenters/file/single line presenter', function () {
  setupRenderingTest();

  it('has classes "single-line-presenter" and "file-single-line-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/file/single-line-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('single-line-presenter')
      .and.to.have.class('file-single-line-presenter');
  });

  it('presents passed value as a file', async function () {
    this.set('value', { name: 'file1.txt' });
    await render(hbs`{{atm-workflow/value-presenters/file/single-line-presenter
      value=value
    }}`);

    expect(find('.single-line-presenter')).to.have.trimmed.text('<File "file1.txt">');
  });
});
