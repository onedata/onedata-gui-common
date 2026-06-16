import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import {
  render,
  blur,
  click,
  focus,
  find,
  findAll,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import RadioField from 'onedata-gui-common/utils/form-component/radio-field';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import { set } from '@ember/object';

describe('Integration | Component | form-component/radio-field', function () {
  const { afterEach } = setupRenderingTest();

  beforeEach(function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('somePrefix.field1.options.first.label')
      .returns('First')
      .withArgs('somePrefix.field1.options.second.label')
      .returns('Second')
      .withArgs('somePrefix.field1.options.third.label')
      .returns('Third');

    this.set('field', RadioField.create({
      ownerSource: this.owner,
      i18nPrefix: 'somePrefix',
      name: 'field1',
      options: [{
        value: 1,
        name: 'first',
      }, {
        value: 2,
        name: 'second',
      }, {
        value: 3,
        name: 'third',
      }],
    }));
  });

  afterEach(function () {
    this.field.destroy();
  });

  it(
    'has class "radio-field"',
    async function () {
      await render(hbs `<FormComponent::RadioField @field={{field}} />`);

      expect(find('.radio-field')).to.exist;
    }
  );

  it(
    'renders three radio inputs with labels',
    async function () {
      await render(hbs `<FormComponent::RadioField @field={{field}} />`);

      expect(findAll('input')).to.have.length(3);
      expect(find('.option-first .one-label').textContent.trim())
        .to.equal('First');
      expect(find('.option-second .one-label').textContent.trim())
        .to.equal('Second');
      expect(find('.option-third .one-label').textContent.trim())
        .to.equal('Third');
    }
  );

  it(
    'can be disabled',
    async function () {
      this.set('field.isEnabled', false);

      await render(hbs `<FormComponent::RadioField @field={{field}} />`);

      expect(find('.one-way-radio-group')).to.have.class('disabled');
    }
  );

  it(
    'notifies field object about lost focus',
    async function () {
      const focusLostSpy = sinon.spy(this.get('field'), 'focusLost');

      await render(hbs `<FormComponent::RadioField @field={{field}} />`);

      await focus('.option-first input');
      await blur('.option-first input');

      expect(focusLostSpy).to.be.calledOnce;
    }
  );

  it(
    'notifies field object about changed value',
    async function () {
      const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');

      await render(hbs `<FormComponent::RadioField @field={{field}} />`);

      await click('.option-first');

      expect(valueChangedSpy).to.be.calledOnce;
      expect(valueChangedSpy).to.be.calledWith(1);
    }
  );

  it('sets input value to value specified in field object', async function () {
    this.set('field.value', 2);

    await render(hbs `<FormComponent::RadioField @field={{field}} />`);

    expect(find('.option-second input').checked).to.equal(true);
  });

  it('sets input id according to "fieldId"', async function () {
    await render(hbs `
      <FormComponent::RadioField @field={{field}} @fieldId="abc" />
    `);

    expect(find('input#abc')).to.exist;
  });

  it('renders selected option label when field is in "view" mode', async function () {
    const field = this.get('field');
    set(field, 'value', 2);
    field.changeMode('view');

    await render(hbs `<FormComponent::RadioField @field={{field}} />`);

    expect(this.element.textContent.trim()).to.equal('Second');
    expect(find('input')).to.not.exist;
  });

  it('renders additional button', async function () {
    const additionalButtonAction = sinon.spy();
    this.set('field.hasAdditionalButton', true);
    this.set('field.additionalButtonConfig', {
      name: 'Additional button',
      buttonAction: additionalButtonAction,
    });

    await render(hbs `<FormComponent::RadioField @field={{field}} />`);

    const additionalButton = find('.one-button');
    expect(additionalButton).to.exist;
    expect(additionalButton.textContent.trim()).to.include('Additional button');
  });

  it('triggers additional button action on click', async function () {
    const additionalButtonAction = sinon.spy();
    this.set('field.hasAdditionalButton', true);
    this.set('field.additionalButtonConfig', {
      name: 'Additional button',
      buttonAction: additionalButtonAction,
    });

    await render(hbs `<FormComponent::RadioField @field={{field}} />`);

    await click('.one-button');

    expect(additionalButtonAction).to.be.calledOnce;
  });
});
