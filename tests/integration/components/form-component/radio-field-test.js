import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import RadioField from 'onedata-gui-common/utils/form-component/radio-field';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import { blur, click, focus } from 'ember-native-dom-helpers';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | form component/radio field', function () {
  setupComponentTest('form-component/radio-field', {
    integration: true
  });

  beforeEach(function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('somePrefix.field1.options.first.label')
      .returns('First')
      .withArgs('somePrefix.field1.options.second.label')
      .returns('Second')
      .withArgs('somePrefix.field1.options.third.label')
      .returns('Third');

    this.set('field', RadioField.create({
      ownerSource: this,
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
    function () {
      this.render(hbs `{{form-component/radio-field field=field}}`);

      expect(this.$('.radio-field')).to.exist;
    }
  );

  it(
    'renders three radio inputs with labels',
    function () {
      this.render(hbs `{{form-component/radio-field field=field}}`);

      return wait()
        .then(() => {
          expect(this.$('input')).to.have.length(3);
          expect(this.$('.option-first .one-label').text().trim())
            .to.equal('First');
          expect(this.$('.option-second .one-label').text().trim())
            .to.equal('Second');
          expect(this.$('.option-third .one-label').text().trim())
            .to.equal('Third');
        });
    }
  );

  it(
    'can be disabled',
    function () {
      this.set('field.isEnabled', false);

      this.render(hbs `{{form-component/radio-field field=field}}`);

      expect(this.$('.one-way-radio-group')).to.have.class('disabled');
    }
  );

  it(
    'notifies field object about lost focus',
    function () {
      const focusLostSpy = sinon.spy(this.get('field'), 'focusLost');

      this.render(hbs `{{form-component/radio-field field=field}}`);

      return wait()
        .then(() => focus('.option-first input'))
        .then(() => blur('.option-first input'))
        .then(() => expect(focusLostSpy).to.be.calledOnce);
    }
  );

  it(
    'notifies field object about changed value',
    function () {
      const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');

      this.render(hbs `{{form-component/radio-field field=field}}`);

      return wait()
        .then(() => click('.option-first'))
        .then(() => {
          expect(valueChangedSpy).to.be.calledOnce;
          expect(valueChangedSpy).to.be.calledWith(1);
        });
    }
  );

  it('sets input value to value specified in field object', function () {
    this.set('field.value', 2);

    this.render(hbs `{{form-component/radio-field field=field}}`);

    return wait()
      .then(() =>
        expect(this.$('.option-second input').prop('checked')).to.equal(true)
      );
  });

  it('sets input id according to "fieldId"', function () {
    this.render(hbs `
      {{form-component/radio-field field=field fieldId="abc"}}
    `);

    return wait()
      .then(() => expect(this.$('input#abc')).to.exist)
  });
});
