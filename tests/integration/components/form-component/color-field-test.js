import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, focus, blur, find, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import ColorField from 'onedata-gui-common/utils/form-component/color-field';
import sinon from 'sinon';

describe('Integration | Component | form-component/color-field', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('field', ColorField.create());
  });

  it('has class "color-field"', async function () {
    await render(hbs `{{form-component/color-field field=field}}`);

    expect(find('.color-field')).to.exist;
  });

  it('renders color input', async function () {
    await render(hbs `{{form-component/color-field field=field}}`);

    expect(find('input[type="color"]')).to.exist;
  });

  it('can be disabled', async function () {
    this.set('field.isEnabled', false);

    await render(hbs `{{form-component/color-field field=field}}`);

    expect(find('input')).to.have.attr('disabled');
  });

  it('notifies field object about lost focus', async function () {
    const focusLostSpy = sinon.spy(this.field, 'focusLost');
    await render(hbs `{{form-component/color-field field=field}}`);

    await focus('input');
    await blur('input');

    expect(focusLostSpy).to.be.calledOnce;
  });

  it('notifies field object about changed value', async function () {
    const valueChangedSpy = sinon.spy(this.field, 'valueChanged');
    await render(hbs `{{form-component/color-field field=field}}`);

    const input = find('input');
    input.value = '#ff0000';
    await triggerEvent(input, 'input');

    expect(valueChangedSpy).to.be.calledOnce;
    expect(valueChangedSpy).to.be.calledWith('#ff0000');
  });

  it('sets input value to value specified in field object', async function () {
    this.set('field.value', '#ff0000');

    await render(hbs `{{form-component/color-field field=field}}`);

    expect(find('input')).to.have.value('#ff0000');
  });

  it('sets input id according to "fieldId"', async function () {
    await render(hbs `
      {{form-component/color-field field=field fieldId="abc"}}
    `);

    expect(find('input#abc')).to.exist;
  });

  it('renders blocked toggle when field is in "view" mode', async function () {
    this.field.changeMode('view');

    await render(hbs `{{form-component/color-field field=field}}`);

    expect(find('input')).to.have.attr('disabled');
  });
});
