import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one checkbox', function () {
  setupComponentTest('one-checkbox', {
    integration: true
  });

  it('renders one-way-checkbox internally', function () {
    this.render(hbs `{{one-checkbox
      class="this-checkbox"
      isReadOnly=false
      checked=false}}`);

    expect(this.$('input[type=checkbox]'), this.$().html()).to.exist;
  });

  it('renders with base class', function () {
    this.render(hbs `{{one-checkbox
      class="this-checkbox"
      isReadOnly=false
      checked=false}}`);
    expect(this.$('.this-checkbox')).to.exist;
    expect(this.$('.this-checkbox')).to.have.class('one-checkbox');
    expect(this.$('.this-checkbox')).to.have.class('one-checkbox-base');
  });

  it('invokes update action on click', function (done) {
    let toggleSelectionHandler = sinon.spy();
    this.on('toggleSelection', toggleSelectionHandler);

    this.render(hbs `{{one-checkbox 
      class="this-checkbox"
      isReadOnly=false
      checked=false
      update=(action "toggleSelection")}}`);

    expect(this.$('.this-checkbox')).to.exist;
    click('.this-checkbox').then(() => {
      expect(toggleSelectionHandler).to.be.calledOnce;
      done();
    });
  });
});
