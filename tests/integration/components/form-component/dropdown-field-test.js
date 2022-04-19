import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, blur, focus, fillIn, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import EmberPowerSelectHelper from '../../../helpers/ember-power-select-helper';
import { set } from '@ember/object';

describe('Integration | Component | form component/dropdown field', function () {
  setupRenderingTest();

  beforeEach(function () {
    const i18nStub = sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('somePrefix.field1.options.first.label')
      .returns('First')
      .withArgs('somePrefix.field1.options.second.label')
      .returns('Second')
      .withArgs('somePrefix.field1.options.third.label')
      .returns('Third');
    const field = DropdownField.create({
      ownerSource: this.owner,
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
    async function () {
      await render(hbs `{{form-component/dropdown-field field=field}}`);

      expect(find('.dropdown-field')).to.exist;
    }
  );

  it(
    'renders three dropdown options',
    async function () {
      await render(hbs `{{form-component/dropdown-field field=field}}`);

      const dropdown = new DropdownHelper();
      await dropdown.open();

      [{
        label: 'First',
        icon: 'space',
      }, {
        label: 'Second',
      }, {
        label: 'Third',
      }].forEach(({ label, icon }, index) => {
        const option = dropdown.getNthOption(index + 1);
        expect(option.querySelector('.text').textContent.trim()).to.equal(label);
        if (icon) {
          expect(option.querySelector('.one-icon')).to.have.class(`oneicon-${icon}`);
        }
      });
    }
  );

  it(
    'can be disabled',
    async function () {
      this.set('field.isEnabled', false);

      await render(hbs `{{form-component/dropdown-field field=field}}`);

      const dropdownTrigger = new DropdownHelper().getTrigger();
      expect(dropdownTrigger).to.have.attr('aria-disabled', 'true');
    }
  );

  it(
    'notifies field object about lost focus',
    async function () {
      const focusLostSpy = sinon.spy(this.get('field'), 'focusLost');

      await render(hbs `{{form-component/dropdown-field field=field}}`);

      const dropdownTrigger = new DropdownHelper().getTrigger();
      await focus(dropdownTrigger);
      await blur(dropdownTrigger);

      expect(focusLostSpy).to.be.calledOnce;
    }
  );

  it(
    'notifies field object about changed value',
    async function () {
      const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');

      await render(hbs `{{form-component/dropdown-field field=field}}`);

      const dropdown = new DropdownHelper();
      await dropdown.selectOption(2);

      expect(valueChangedSpy).to.be.calledOnce;
      expect(valueChangedSpy).to.be.calledWith(2);
    }
  );

  it('sets dropdown value to value specified in field object', async function () {
    this.set('field.value', 2);

    await render(hbs `{{form-component/dropdown-field field=field}}`);

    const dropdownTrigger = new DropdownHelper().getTrigger();
    expect(dropdownTrigger.textContent.trim()).to.equal('Second');
  });

  it('sets input id according to "fieldId"', async function () {
    await render(hbs `
      {{form-component/dropdown-field field=field fieldId="abc"}}
    `);

    const dropdownTrigger = new DropdownHelper().getTrigger();
    expect(dropdownTrigger).to.have.attr('id', 'abc');
  });

  it(
    'shows placeholder specified in field',
    async function () {
      this.get('i18nStub')
        .withArgs('somePrefix.field1.placeholder')
        .returns('Select option...');

      await render(hbs `{{form-component/dropdown-field field=field}}`);

      const dropdownTrigger = new DropdownHelper().getTrigger();
      expect(dropdownTrigger.textContent.trim()).to.equal('Select option...');
    }
  );

  it(
    'shows search input by default',
    async function () {
      await render(hbs `{{form-component/dropdown-field field=field}}`);

      const dropdown = new DropdownHelper();
      await dropdown.open();

      expect(dropdown.getSearchInput()).to.exist;
    }
  );

  it('filters available options according to query in search input', async function () {
    await render(hbs `{{form-component/dropdown-field field=field}}`);
    const dropdown = new DropdownHelper();

    await dropdown.open();
    await fillIn(dropdown.getSearchInput(), ' Eco');

    const option = dropdown.getNthOption(1);
    expect(option.querySelector('.text').textContent.trim()).to.equal('Second');
    expect(dropdown.getNthOption(2)).to.not.exist;
  });

  it(
    'does not show search input if field "showSearch" is false',
    async function () {
      this.set('field.showSearch', false);
      await render(hbs `{{form-component/dropdown-field field=field}}`);

      const dropdown = new DropdownHelper();
      await dropdown.open();

      expect(dropdown.getSearchInput()).to.not.exist;
    }
  );

  it('renders raw icon and label of selected option when field is in "view" mode', async function () {
    const field = this.get('field');
    set(field, 'value', 1);
    field.changeMode('view');

    await render(hbs `{{form-component/dropdown-field field=field}}`);

    expect(find('.text').textContent.trim()).to.equal('First');
    expect(find('.one-icon')).to.have.class('oneicon-space');
    expect(find('.ember-basic-dropdown')).to.not.exist;
  });

  it('does not apply "small" class to trigger and dropdown when "size" is "md"', async function () {
    this.set('field.size', 'md');

    await render(hbs `{{form-component/dropdown-field field=field}}`);

    const dropdown = new DropdownHelper();
    await dropdown.open();
    expect(new DropdownHelper().getTrigger()).to.not.have.class('small');
    expect(document.querySelector('.ember-basic-dropdown-content'))
      .to.not.have.class('small');
  });

  it('applies "small" class to trigger and dropdown when "size" is "sm"', async function () {
    this.set('field.size', 'sm');

    await render(hbs `{{form-component/dropdown-field field=field}}`);

    const dropdown = new DropdownHelper();
    await dropdown.open();
    expect(new DropdownHelper().getTrigger()).to.have.class('small');
    expect(document.querySelector('.ember-basic-dropdown-content'))
      .to.have.class('small');
  });
});

class DropdownHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.dropdown-field', '.ember-basic-dropdown-content');
  }
}
