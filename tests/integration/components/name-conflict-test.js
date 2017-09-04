import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | name conflict', function () {
  setupComponentTest('name-conflict', {
    integration: true
  });

  it('renders name with conflict label if available', function () {
    this.set('item', {
      name: 'name',
      conflictLabel: 'label',
    });

    this.render(hbs`{{name-conflict item=item}}`);
    expect(this.$()).to.contain('name#label');
  });

  it('renders name without conflict label if not available', function () {
    this.set('item', { name: 'name' });

    this.render(hbs`{{name-conflict item=item}}`);
    expect(this.$()).to.contain('name');
  });
});
