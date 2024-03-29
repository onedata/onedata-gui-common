import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import CapacityField from 'onedata-gui-common/utils/form-component/capacity-field';
import sinon from 'sinon';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import { set } from '@ember/object';
import { render, focus, blur, fillIn, find } from '@ember/test-helpers';
import globals from 'onedata-gui-common/utils/globals';

describe('Integration | Component | form-component/capacity-field', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('field', CapacityField.create({ ownerSource: this.owner }));
  });

  it('has class "capacity-field"', async function () {
    await render(hbs `{{form-component/capacity-field field=field}}`);

    expect(find('.capacity-field')).to.exist;
  });

  it('renders one-way-capacity component', async function () {
    await render(hbs `{{form-component/capacity-field field=field}}`);

    expect(find('.one-way-capacity')).to.exist;
  });

  it('can be disabled', async function () {
    this.set('field.isEnabled', false);

    await render(hbs `{{form-component/capacity-field field=field}}`);

    expect(find('.size-number-input').disabled).to.be.true;
    expect(find('.ember-power-select-trigger'))
      .to.have.attr('aria-disabled', 'true');
  });

  it('notifies field object about lost focus', async function () {
    const focusLostSpy = sinon.spy(this.get('field'), 'focusLost');
    await render(hbs `{{form-component/capacity-field field=field}}`);

    await focus('.size-number-input');
    await blur('.size-number-input');

    expect(focusLostSpy).to.be.calledOnce;
  });

  it('notifies field object about changed value', async function () {
    const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');
    await render(hbs `{{form-component/capacity-field field=field}}`);

    await fillIn('.size-number-input', '10');
    await selectChoose('.capacity-field', 'GiB');

    expect(valueChangedSpy).to.be.calledTwice
      .and.to.be.calledWith(String(10 * 1024 * 1024 * 1024));
  });

  it('notifies field object about changed value (due to changed unit)', async function () {
    const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');
    await render(hbs `{{form-component/capacity-field field=field}}`);

    await fillIn('.size-number-input', '10');

    expect(valueChangedSpy).to.be.calledOnce
      .and.to.be.calledWith(String(10 * 1024 * 1024));
  });

  it('sets input value to tags specified in field object', async function () {
    this.set('field.value', '20971520');

    await render(hbs `{{form-component/capacity-field field=field}}`);

    expect(find('.size-number-input').value).to.equal('20');
    expect(find('.ember-power-select-trigger').textContent).to.contain('MiB');
  });

  it('sets input id according to "fieldId"', async function () {
    await render(hbs `
      {{form-component/capacity-field field=field fieldId="abc"}}
    `);

    expect(find('.size-number-input#abc')).to.exist;
  });

  it('shows units starting from "MiB"s by default', async function () {
    await render(hbs `{{form-component/capacity-field field=field}}`);

    await expectUnits(['MiB', 'GiB', 'TiB', 'PiB']);
  });

  it('allows to specify custom list of units', async function () {
    const expectedUnits = this.set('field.allowedUnits', ['B', 'KiB', 'MiB']);

    await render(hbs `{{form-component/capacity-field field=field}}`);

    await expectUnits(expectedUnits);
  });

  it('sets placeholder according to "placeholder"', async function () {
    this.set('field.placeholder', 'test');

    await render(hbs `{{form-component/capacity-field field=field}}`);

    expect(find('input').placeholder).to.equal('test');
  });

  it('renders capacity value as text when field is in "view" mode', async function () {
    const field = this.get('field');
    set(field, 'value', '20971520');
    field.changeMode('view');

    await render(hbs `{{form-component/capacity-field field=field}}`);

    expect(this.element.textContent.trim()).to.equal('20 MiB');
  });
});

async function expectUnits(expectedUnits) {
  await clickTrigger('.capacity-field');

  const options = globals.document.querySelectorAll('.ember-power-select-option');
  expect(options).to.have.length(expectedUnits.length);
  expectedUnits.forEach((unit, idx) => {
    expect(options[idx].textContent.trim()).to.equal(unit);
  });
}
