import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Component | name conflict', function () {
  setupRenderingTest();

  it('renders name with conflict label if available', async function () {
    this.set('item', {
      name: 'name',
      conflictLabel: 'label',
    });

    await render(hbs `{{name-conflict item=item}}`);
    expect(this.element.textContent).to.contain('name#label');
  });

  it('renders name with conflict label with custom separator', async function () {
    this.set('item', {
      name: 'name',
      conflictLabel: 'label',
    });

    await render(hbs `{{name-conflict item=item separator="^"}}`);
    expect(this.element.textContent).to.contain('name^label');
  });

  it('renders name without conflict label if not available', async function () {
    this.set('item', { name: 'name' });

    await render(hbs `{{name-conflict item=item}}`);
    expect(this.element.textContent).to.contain('name');
  });
});
