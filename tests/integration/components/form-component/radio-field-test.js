import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, blur, click, focus } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import RadioField from 'onedata-gui-common/utils/form-component/radio-field';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import { set } from '@ember/object';

describe('Integration | Component | form component/radio field', function () {
  setupRenderingTest();

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

  it(
    'has class "radio-field"',
    async function () {
      await render(hbs `{{form-component/radio-field field=field}}`);

      expect(this.$('.radio-field')).to.exist;
    }
  );

  it(
    'renders three radio inputs with labels',
    async function () {
      await render(hbs `{{form-component/radio-field field=field}}`);

      expect(this.$('input')).to.have.length(3);
      expect(this.$('.option-first .one-label').text().trim())
        .to.equal('First');
      expect(this.$('.option-second .one-label').text().trim())
        .to.equal('Second');
      expect(this.$('.option-third .one-label').text().trim())
        .to.equal('Third');
    }
  );

  it(
    'can be disabled',
    async function () {
      this.set('field.isEnabled', false);

      await render(hbs `{{form-component/radio-field field=field}}`);

      expect(this.$('.one-way-radio-group')).to.have.class('disabled');
    }
  );

  it(
    'notifies field object about lost focus',
    async function () {
      const focusLostSpy = sinon.spy(this.get('field'), 'focusLost');

      await render(hbs `{{form-component/radio-field field=field}}`);

      await focus('.option-first input');
      await blur('.option-first input');

      expect(focusLostSpy).to.be.calledOnce;
    }
  );

  it(
    'notifies field object about changed value',
    async function () {
      const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');

      await render(hbs `{{form-component/radio-field field=field}}`);

      await click('.option-first');

      expect(valueChangedSpy).to.be.calledOnce;
      expect(valueChangedSpy).to.be.calledWith(1);
    }
  );

  it('sets input value to value specified in field object', async function () {
    this.set('field.value', 2);

    await render(hbs `{{form-component/radio-field field=field}}`);

    expect(this.$('.option-second input').prop('checked')).to.equal(true);
  });

  it('sets input id according to "fieldId"', async function () {
    await render(hbs `
      {{form-component/radio-field field=field fieldId="abc"}}
    `);

    expect(this.$('input#abc')).to.exist;
  });

  it('renders selected option label when field is in "view" mode', async function () {
    const field = this.get('field');
    set(field, 'value', 2);
    field.changeMode('view');

    await render(hbs `{{form-component/radio-field field=field}}`);

    expect(this.$().text().trim()).to.equal('Second');
    expect(this.$('input')).to.not.exist;
  });
});
