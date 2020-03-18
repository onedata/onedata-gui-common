import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import { blur, focus } from 'ember-native-dom-helpers';
import EmberPowerSelectHelper from '../../../helpers/ember-power-select-helper';
import $ from 'jquery';
import wait from 'ember-test-helpers/wait';
import { set } from '@ember/object';

describe('Integration | Component | form component/dropdown field', function () {
  setupComponentTest('form-component/dropdown-field', {
    integration: true
  });

  beforeEach(function () {
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
              expect($option.find('.one-icon')).to.have.class(`oneicon-${icon}`);
            }
          })
        });
    }
  );

  it(
    'can be disabled',
    function () {
      this.set('field.isEnabled', false);

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
    'does not show search input if field "showSearch" is false',
    function () {
      this.set('field.showSearch', false);
      this.render(hbs `{{form-component/dropdown-field field=field}}`);

      const dropdown = new DropdownHelper();
      return wait()
        .then(() => dropdown.open())
        .then(() => expect(dropdown.getSearchInput()).to.not.exist);
    }
  );

  it('renders raw icon and label of selected option when field is in "view" mode', function () {
    const field = this.get('field');
    set(field, 'value', 1);
    field.changeMode('view');

    this.render(hbs `{{form-component/dropdown-field field=field}}`);

    expect(this.$('.text').text().trim()).to.equal('First');
    expect(this.$('.one-icon')).to.have.class('oneicon-space');
    expect(this.$('.ember-basic-dropdown')).to.not.exist;
  });
});

class DropdownHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.ember-basic-dropdown');
  }
}
