import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import CapacityField from 'onedata-gui-common/utils/form-component/capacity-field';
import { focus, blur, fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import $ from 'jquery';
import { clickTrigger, selectChoose } from '../../../helpers/ember-power-select';
import { set } from '@ember/object';

describe('Integration | Component | form component/capacity field', function () {
  setupComponentTest('form-component/capacity-field', {
    integration: true,
  });

  beforeEach(function () {
    this.set('field', CapacityField.create({ ownerSource: this }));
  });

  it('has class "capacity-field"', function () {
    this.render(hbs `{{form-component/capacity-field field=field}}`);

    expect(this.$('.capacity-field')).to.exist;
  });

  it('renders one-way-capacity component', function () {
    this.render(hbs `{{form-component/capacity-field field=field}}`);

    expect(this.$('.one-way-capacity')).to.exist;
  });

  it('can be disabled', function () {
    this.set('field.isEnabled', false);

    this.render(hbs `{{form-component/capacity-field field=field}}`);

    expect(this.$('.size-number-input')).to.have.attr('disabled');
    expect(this.$('.ember-power-select-trigger'))
      .to.have.attr('aria-disabled', 'true');
  });

  it('notifies field object about lost focus', async function () {
    const focusLostSpy = sinon.spy(this.get('field'), 'focusLost');
    this.render(hbs `{{form-component/capacity-field field=field}}`);

    await focus('.size-number-input');
    await blur('.size-number-input');

    expect(focusLostSpy).to.be.calledOnce;
  });

  it('notifies field object about changed value', async function () {
    const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');
    this.render(hbs `{{form-component/capacity-field field=field}}`);

    await fillIn('.size-number-input', '10');
    await selectChoose('.capacity-field', 'GiB');

    expect(valueChangedSpy).to.be.calledTwice
      .and.to.be.calledWith(String(10 * 1024 * 1024 * 1024));
  });

  it('notifies field object about changed value (due to changed unit)', async function () {
    const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');
    this.render(hbs `{{form-component/capacity-field field=field}}`);

    await fillIn('.size-number-input', '10');

    expect(valueChangedSpy).to.be.calledOnce
      .and.to.be.calledWith(String(10 * 1024 * 1024));
  });

  it('sets input value to tags specified in field object', async function () {
    this.set('field.value', '20971520');

    this.render(hbs `{{form-component/capacity-field field=field}}`);
    await wait();

    expect(this.$('.size-number-input')).to.have.value('20');
    expect(this.$('.ember-power-select-trigger').text()).to.contain('MiB');
  });

  it('sets input id according to "fieldId"', function () {
    this.render(hbs `
      {{form-component/capacity-field field=field fieldId="abc"}}
    `);

    expect(this.$('.size-number-input#abc')).to.exist;
  });

  it('shows units starting from "MiB"s by default', async function () {
    this.render(hbs `{{form-component/capacity-field field=field}}`);

    await expectUnits(['MiB', 'GiB', 'TiB', 'PiB']);
  });

  it('allows to specify custom list of units', async function () {
    const expectedUnits = this.set('field.allowedUnits', ['B', 'KiB', 'MiB']);

    this.render(hbs `{{form-component/capacity-field field=field}}`);

    await expectUnits(expectedUnits);
  });

  it('sets placeholder according to "placeholder"', function () {
    this.set('field.placeholder', 'test');

    this.render(hbs `{{form-component/capacity-field field=field}}`);

    expect(this.$('input').attr('placeholder')).to.equal('test');
  });

  it('renders capacity value as text when field is in "view" mode', function () {
    const field = this.get('field');
    set(field, 'value', '20971520');
    field.changeMode('view');

    this.render(hbs `{{form-component/capacity-field field=field}}`);

    expect(this.$().text().trim()).to.equal('20 MiB');
  });
});

async function expectUnits(expectedUnits) {
  await clickTrigger('.capacity-field');

  const $options = $('.ember-power-select-option');
  expect($options).to.have.length(expectedUnits.length);
  expectedUnits.forEach((unit, idx) => {
    expect($options.eq(idx).text().trim()).to.equal(unit);
  });
}
