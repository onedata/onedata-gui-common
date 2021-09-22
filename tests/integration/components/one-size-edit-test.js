import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import EmberPowerSelectHelper from '../../helpers/ember-power-select-helper';
import { click, fillIn } from 'ember-native-dom-helpers';

class SizeUnitSelectHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.size-unit-select-group', '.ember-basic-dropdown-content');
  }
}

describe('Integration | Component | one size edit', function () {
  setupComponentTest('one-size-edit', {
    integration: true,
  });

  it('displays size number and unit in display mode', function () {
    this.set('value', 3 * Math.pow(1024, 3));
    this.render(hbs `{{one-size-edit value=value}}`);
    expect(this.$('.size-number-input').val(), 'size number').to.equal('3 GiB');
  });

  it('sets the size number and selector to proper size unit when editing',
    function () {
      this.set('value', 3 * Math.pow(1024, 3));
      this.render(hbs `{{one-size-edit value=value forceStartEdit=true}}`);
      return wait()
        .then(() => {
          expect(this.$('.size-number-input').val(), 'size number')
            .to.equal('3');
          expect(
            this.$('.size-unit-select-group .ember-power-select-selected-item')
            .text(),
            'size unit select'
          ).to.match(/GiB/);
        });
    }
  );

  it('submits the bytes value to provided onSave action', function () {
    this.set('value', 1 * Math.pow(1024, 2));
    const onSave = sinon.stub().resolves();
    this.set('onSave', onSave);
    this.render(
      hbs `{{one-size-edit value=value forceStartEdit=true onSave=onSave}}`
    );

    return wait()
      .then(() => {
        return fillIn('.size-number-input', '2');
      })
      .then(() => {
        const select = new SizeUnitSelectHelper();
        // option 1: MiB, option 2: GiB
        return select.selectOption(2, () => {
          expect(
            this.$(
              '.size-unit-select-group .ember-power-select-selected-item'
            ).text(),
            'size unit select'
          ).to.match(/GiB/);
          return click('.btn-save');
        });
      })
      .then(() => {
        expect(onSave).to.be.calledOnce;
        expect(onSave).to.be.calledWith(String(2 * Math.pow(1024, 3)));
      });
  });
});
