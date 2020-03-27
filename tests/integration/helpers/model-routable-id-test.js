import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe('Integration | Helper | model routable id', function () {
  setupComponentTest('model-routable-id', {
    integration: true,
  });

  it('extracts id', function () {
    this.set('inputValue', EmberObject.create({ id: '1' }));
    this.render(hbs `{{model-routable-id inputValue}}`);
    expect(this.$().text().trim()).to.equal('1');
  });
});
