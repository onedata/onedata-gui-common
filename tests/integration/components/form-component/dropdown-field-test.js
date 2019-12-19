import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import { blur, focus } from 'ember-native-dom-helpers';
import EmberPowerSelectHelper from '../../../helpers/ember-power-select-helper';
import $ from 'jquery';
import wait from 'ember-test-helpers/wait';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { setProperties } from '@ember/object';
import { reject } from 'rsvp';
import TestAdapter from '@ember/test/adapter';
import Ember from 'ember';

describe('Integration | Component | form component/dropdown field', function () {
  setupComponentTest('form-component/dropdown-field', {
    integration: true
  });

  beforeEach(function () {
    this.originalLoggerError = Ember.Logger.error;
    this.originalTestAdapterException = TestAdapter.exception;
    Ember.Logger.error = function () {};
    Ember.Test.adapter.exception = function () {};

    const i18nStub = sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('somePrefix.field1.options.first.label')
      .returns('First')
      .withArgs('somePrefix.field1.options.second.label')
      .returns('Second')
      .withArgs('somePrefix.field1.options.third.label')
      .returns('Third');
    const field = DropdownField.create({
      ownerSource: this,
      i18nPrefix: 'somePrefix',
      name: 'field1',
      options: [{
        value: 1,
        name: 'first',
        icon: 'space',
      }, {
        value: 2,
        name: 'second',
      }, {
        value: 3,
        name: 'third',
      }],
    });

    this.setProperties({
      i18nStub,
      field,
    });
  });

  afterEach(function () {
    Ember.Logger.error = this.originalLoggerError;
    Ember.Test.adapter.exception = this.originalTestAdapterException;
  });

  it(
    'has class "dropdown-field"',
    function () {
      this.render(hbs `{{form-component/dropdown-field field=field}}`);

      expect(this.$('.dropdown-field')).to.exist;
    }
  );

  it(
    'renders three dropdown options',
    function () {
      this.render(hbs `{{form-component/dropdown-field field=field}}`);

      const dropdown = new DropdownHelper();
      return wait()
        .then(() => dropdown.open())
        .then(() => {
          [{
            label: 'First',
            icon: 'space',
          }, {
            label: 'Second',
          }, {
            label: 'Third',
          }].forEach(({ label, icon }, index) => {
            const $option = $(dropdown.getNthOption(index + 1));

            expect($option.find('.text').text().trim()).to.equal(label);
            if (icon) {
              expect($option.find('.one-icon'))
                .to.have.class(`oneicon-${icon}`);
            }
          })
        });
    }
  );

  it(
    'can be disabled',
    function () {
      this.get('field').disable();

      this.render(hbs `{{form-component/dropdown-field field=field}}`);

      return wait()
        .then(() => {
          const dropdownTrigger = new DropdownHelper().getTrigger();
          expect($(dropdownTrigger)).to.have.attr('aria-disabled', 'true')
        });
    }
  );

  it(
    'notifies field object about lost focus',
    function () {
      const focusLostSpy = sinon.spy(this.get('field'), 'focusLost');

      this.render(hbs `{{form-component/dropdown-field field=field}}`);

      return wait()
        .then(() => {
          const dropdownTrigger = new DropdownHelper().getTrigger();
          return focus(dropdownTrigger)
            .then(() => blur(dropdownTrigger))
            .then(() => expect(focusLostSpy).to.be.calledOnce);
        });
    }
  );

  it(
    'notifies field object about changed value',
    function () {
      const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');

      this.render(hbs `{{form-component/dropdown-field field=field}}`);

      return wait()
        .then(() => {
          const dropdown = new DropdownHelper();
          return dropdown.selectOption(2)
            .then(() => {
              expect(valueChangedSpy).to.be.calledOnce;
              expect(valueChangedSpy).to.be.calledWith(2);
            });
        });
    }
  );

  it('sets dropdown value to value specified in field object', function () {
    this.set('field.value', 2);

    this.render(hbs `{{form-component/dropdown-field field=field}}`);

    return wait()
      .then(() => {
        const $dropdownTrigger = $(new DropdownHelper().getTrigger());
        expect($dropdownTrigger.text().trim()).to.equal('Second');
      });
  });

  it('sets input id according to "fieldId"', function () {
    this.render(hbs `
      {{form-component/dropdown-field field=field fieldId="abc"}}
    `);

    return wait()
      .then(() => {
        const $dropdownTrigger = $(new DropdownHelper().getTrigger());
        expect($dropdownTrigger.attr('id')).to.equal('abc');
      });
  });

  it(
    'shows "Loading..." in dropdown and nothing selected when options are loading',
    function () {
      const {
        i18nStub,
        field,
      } = this.getProperties('i18nStub', 'field');
      i18nStub
        .withArgs('somePrefix.field1.loadingMessage')
        .returns('Loading...')
        .withArgs('somePrefix.field1.placeholder')
        .returns('');
      setProperties(field, {
        value: 2,
        options: PromiseArray.create({
          promise: new Promise(() => {}),
        }),
      });

      this.render(hbs `{{form-component/dropdown-field field=field}}`);

      const dropdown = new DropdownHelper();
      return wait()
        .then(() => dropdown.open())
        .then(() => {
          const $trigger = $(dropdown.getTrigger());
          const $loadingOption = $(dropdown.getNthOption(1));

          expect($trigger.text().trim()).to.be.empty;
          expect($loadingOption.text().trim()).to.equal('Loading...');
        });
    }
  );

  it(
    'preselectes value specified in field after loading',
    function () {
      let resolvePromise;
      const options = this.get('field.options');
      setProperties(this.get('field'), {
        value: 2,
        options: PromiseArray.create({
          promise: new Promise(resolve => resolvePromise = resolve),
        }),
      });

      this.render(hbs `{{form-component/dropdown-field field=field}}`);

      const dropdown = new DropdownHelper();
      return wait()
        .then(() => {
          resolvePromise(options);
          return wait();
        })
        .then(() =>
          expect($(dropdown.getTrigger()).text().trim()).to.equal('Second')
        );
    }
  );

  it(
    'shows error when options loading failed',
    function () {
      setProperties(this.get('field'), {
        value: 2,
        options: PromiseArray.create({
          promise: reject({ id: 'forbidden' }),
        }),
      });

      this.render(hbs `{{form-component/dropdown-field field=field}}`);

      const dropdown = new DropdownHelper();
      return wait()
        .then(() => {
          expect(dropdown.getTrigger()).to.not.exist;
          expect(this.$('.resource-load-error')).to.exist;
          expect(this.$('.error-json').text()).to.contain('"forbidden"');
        });
    }
  );

  it(
    'shows placeholder specified in field',
    function () {
      this.get('i18nStub')
        .withArgs('somePrefix.field1.placeholder')
        .returns('Select option...');

      this.render(hbs `{{form-component/dropdown-field field=field}}`);

      return wait()
        .then(() => {
          const $dropdownTrigger = $(new DropdownHelper().getTrigger());
          expect($dropdownTrigger.text().trim()).to.equal('Select option...');
        });
    }
  );

  it(
    'shows search input by default',
    function () {
      this.render(hbs `{{form-component/dropdown-field field=field}}`);

      const dropdown = new DropdownHelper();
      return wait()
        .then(() => dropdown.open())
        .then(() => expect(dropdown.getSearchInput()).to.exist);
    }
  );

  it(
    'does not show search input if field "showSearch" is falsy',
    function () {
      this.set('field.showSearch', false);
      this.render(hbs `{{form-component/dropdown-field field=field}}`);

      const dropdown = new DropdownHelper();
      return wait()
        .then(() => dropdown.open())
        .then(() => expect(dropdown.getSearchInput()).to.not.exist);
    }
  );
});

class DropdownHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.ember-basic-dropdown');
  }
}
