import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import EmberPowerSelectHelper from '../../helpers/ember-power-select-helper';

class SizeUnitSelectHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.size-unit-select-group', '.ember-basic-dropdown-content');
  }
}

describe('Integration | Component | one size edit', function () {
  setupRenderingTest();

  it('displays size number and unit in display mode', async function () {
    this.set('value', 3 * Math.pow(1024, 3));
    await render(hbs `{{one-size-edit value=value}}`);
    expect(this.$('.size-number-input').val(), 'size number').to.equal('3 GiB');
  });

  it('sets the size number and selector to proper size unit when editing',
    async function () {
      this.set('value', 3 * Math.pow(1024, 3));
      await render(hbs `{{one-size-edit value=value forceStartEdit=true}}`);

      expect(this.$('.size-number-input').val(), 'size number')
        .to.equal('3');
      expect(
        this.$('.size-unit-select-group .ember-power-select-selected-item')
        .text(),
        'size unit select'
      ).to.match(/GiB/);
    }
  );

  it('submits the bytes value to provided onSave action', async function () {
    this.set('value', 1 * Math.pow(1024, 2));
    const onSave = sinon.stub().resolves();
    this.set('onSave', onSave);
    await render(hbs `{{one-size-edit value=value forceStartEdit=true onSave=onSave}}`);

    await fillIn('.size-number-input', '2');
    const select = new SizeUnitSelectHelper();
    // option 1: MiB, option 2: GiB
    await select.selectOption(2);
    expect(
      this.$(
        '.size-unit-select-group .ember-power-select-selected-item'
      ).text(),
      'size unit select'
    ).to.match(/GiB/);

    await click('.btn-save');
    expect(onSave).to.be.calledOnce;
    expect(onSave).to.be.calledWith(String(2 * Math.pow(1024, 3)));
  });
});
