import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, blur, focus, find, findAll, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import CustomValueDropdownField from 'onedata-gui-common/utils/form-component/custom-value-dropdown-field';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import OneDropdownHelper from '../../../helpers/one-dropdown';
import { assert } from '@ember/debug';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import { validator } from 'ember-cp-validations';

describe('Integration | Component | form-component/custom-value-dropdown-field', function () {
  setupRenderingTest();

  //#region standard dropdown features

  it('has classes "dropdown-field" and "custom-value-dropdown-field"', async function () {
    const helper = new Helper(this);

    await helper.render();

    expect(helper.fieldElement).to.have.class('dropdown-field');
    expect(helper.fieldElement).to.have.class('custom-value-dropdown-field');
  });

  it('renders predefined dropdown options with labels and optional icons', async function () {
    const helper = new Helper(this);
    const i18nPrefix = 'somePrefix';
    const fieldName = 'field1';
    const tPath = `${i18nPrefix}.${fieldName}`;
    helper.field = helper.createField({
      i18nPrefix,
      name: fieldName,
      options: [
        { value: 1, name: 'first', icon: 'space' },
        { value: 2, name: 'second' },
        { value: 3, name: 'third' },
      ],
    });
    sinon.stub(helper.i18n, 't')
      .withArgs(`${tPath}.options.first.label`)
      .returns('First')
      .withArgs(`${tPath}.options.second.label`)
      .returns('Second')
      .withArgs(`${tPath}.options.third.label`)
      .returns('Third');

    await helper.render();
    const options = await helper.dropdown.getOptions();

    const expected = [
      { label: 'First', icon: 'space' },
      { label: 'Second' },
      { label: 'Third' },
    ];
    expected.forEach(({ label, icon }, index) => {
      const option = options[index];
      expect(option.querySelector('.text')).to.have.trimmed.text(label);
      if (icon) {
        expect(option.querySelector('.one-icon')).to.have.class(`oneicon-${icon}`);
      }
    });
  });

  it('can be disabled',
    async function () {
      const helper = new Helper(this);
      helper.field = helper.createField({
        isEnabled: false,
      });

      await helper.render();

      expect(helper.dropdown.getTrigger()).to.have.attr('aria-disabled', 'true');
    }
  );

  it('notifies field object about lost focus',
    async function () {
      const helper = new Helper(this);
      helper.field = helper.createField();
      const focusLostSpy = sinon.spy(helper.field, 'focusLost');

      await helper.render();
      const trigger = helper.dropdown.getTrigger();
      await focus(trigger);
      await blur(trigger);

      expect(focusLostSpy).to.be.calledOnce;
    }
  );

  it('notifies field object about changed value',
    async function () {
      const helper = new Helper(this);
      helper.field = helper.createField({
        options: [
          { value: 1, label: 'First' },
          { value: 2, label: 'Second' },
          { value: 3, label: 'Third' },
        ],
      });
      const valueChangedSpy = sinon.spy(helper.field, 'valueChanged');

      await helper.render();
      await helper.dropdown.selectOptionByText('Second');

      expect(valueChangedSpy).to.be.calledOnce;
      expect(valueChangedSpy).to.be.calledWith(2);
    }
  );

  it('sets dropdown value to value specified in field object', async function () {
    const helper = new Helper(this);
    helper.field = helper.createField({
      options: [
        { value: 1, label: 'First' },
        { value: 2, label: 'Second' },
        { value: 3, label: 'Third' },
      ],
      value: 2,
    });

    await helper.render();

    expect(helper.dropdown.getSelectedOptionText()).to.equal('Second');
  });

  it('sets input id according to "fieldId"', async function () {
    const helper = new Helper(this);
    helper.fieldId = 'abc';

    await helper.render();

    expect(helper.dropdown.getTrigger()).to.have.attr('id', 'abc');

  });

  it('shows placeholder specified in field', async function () {
    const helper = new Helper(this);
    const i18nPrefix = 'somePrefix';
    const fieldName = 'field1';
    const tPath = `${i18nPrefix}.${fieldName}`;
    helper.field = helper.createField({
      i18nPrefix: 'somePrefix',
      name: 'field1',
    });
    sinon.stub(helper.i18n, 't')
      .withArgs(`${tPath}.placeholder`)
      .returns('Test placeholder');

    await helper.render();

    expect(helper.dropdown.getPlaceholder()).to.equal('Test placeholder');
  });

  it('does not show search input by default',
    async function () {
      const helper = new Helper(this);

      await helper.render();

      expect(await helper.dropdown.getSearchInput()).to.not.exist;
    }
  );

  it('shows search input if configured',
    async function () {
      const helper = new Helper(this);
      helper.field = helper.createField({
        showSearch: true,
        options: [
          { name: 'single', value: 1, label: 'Single option' },
        ],
      });

      await helper.render();

      expect(await helper.dropdown.getSearchInput()).to.exist;
    }
  );

  it('filters available options according to query in search input', async function () {
    const helper = new Helper(this);
    helper.field = helper.createField({
      showSearch: true,
      options: [
        { name: 'hello-one', value: 'hello-one', label: 'Hello One' },
        { name: 'hello-two', value: 'hello-two', label: 'Hello Two' },
        { name: 'world-one', value: 'world-one', label: 'World One' },
        { name: 'world-two', value: 'world-two', label: 'World Two' },
      ],
    });
    await helper.render();

    await helper.dropdown.fillInSearchInput('Two');

    const options = await helper.dropdown.getOptions();
    expect(options).to.have.lengthOf(2);
    expect(options[0]).to.have.trimmed.text('Hello Two');
    expect(options[1]).to.have.trimmed.text('World Two');
  });

  it('renders raw icon and label of selected option when field is in "view" mode', async function () {
    const helper = new Helper(this);
    helper.field = helper.createField({
      options: [
        { name: 'one', value: 1, label: 'One', icon: 'space' },
        { name: 'two', value: 2, label: 'Two', icon: 'provider' },
      ],
      value: 1,
    });
    helper.field.changeMode('view');

    await helper.render();

    expect(find('.text')).to.have.trimmed.text('One');
    expect(find('.one-icon')).to.have.class('oneicon-space');
    expect(find('.ember-basic-dropdown')).to.not.exist;
  });

  it('does not apply "small" class to trigger and dropdown when "size" is "md"', async function () {
    const helper = new Helper(this);
    helper.field = helper.createField({
      options: [
        { name: 'one', value: 1, label: 'One' },
        { name: 'two', value: 2, label: 'Two' },
      ],
      size: 'md',
    });

    await helper.render();
    await helper.dropdown.open();

    await expect(helper.dropdown.getTrigger()).to.not.have.class('small');
    expect(find('.ember-basic-dropdown-content'))
      .to.not.have.class('small');
  });

  //#endregion

  //#region custom value features

  it('renders special custom value option after predefined options', async function () {
    const helper = new Helper(this);
    const i18nPrefix = 'somePrefix';
    const fieldName = 'field1';
    const tPath = `${i18nPrefix}.${fieldName}`;
    const options = [
      { value: 1, name: 'first' },
      { value: 2, name: 'second' },
    ];
    helper.field = helper.createField({
      i18nPrefix: 'somePrefix',
      name: 'field1',
      options,
    });
    sinon.stub(helper.i18n, 't')
      .withArgs(`${tPath}.options.first.label`)
      .returns('First')
      .withArgs(`${tPath}.options.second.label`)
      .returns('Second');

    await helper.render();
    const renderedOptions = await helper.dropdown.getOptions();

    const expected = [
      { label: 'First' },
      { label: 'Second' },
      // default label of custom value option
      { label: 'Custom value...' },
    ];
    expected.forEach(({ label }, index) => {
      const option = renderedOptions[index];
      expect(option.querySelector('.text:not(input)')).to.have.trimmed.text(label);
    });
  });

  it('renders input in selector trigger when custom value is selected',
    async function () {
      const helper = new Helper(this);
      helper.field = helper.createField({
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
        value: '',
      });

      await helper.render();

      expect(helper.customValueInput).to.exist;
      expect(helper.customValueInput.value).to.equal('');
    }
  );

  it('does not render custom value input in selector trigger if the custom option is not selected',
    async function () {
      const helper = new Helper(this);
      helper.field = helper.createField({
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
        value: 'predefined',
      });

      await helper.render();

      expect(helper.customValueInput).to.not.exist;
    }
  );

  it('renders trigger as active if custom value input is focused',
    async function () {
      const helper = new Helper(this);
      helper.field = helper.createField({
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
        value: '',
      });

      await helper.render();
      await focus(helper.customValueInput);

      expect(helper.dropdown.getTrigger())
        .to.have.class('ember-power-select-trigger--active');
    }
  );

  it('renders "Enter custom value..." placeholder in custom value input by default',
    async function () {
      const helper = new Helper(this);
      helper.field = helper.createField({
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
        value: '',
      });

      await helper.render();

      expect(helper.customValueInput)
        .to.have.attr('placeholder', 'Enter custom value...');
    }
  );

  it('renders custom placeholder in custom value input if it is specified in i18n',
    async function () {
      const helper = new Helper(this);
      const i18nPrefix = 'somePrefix';
      const fieldName = 'field1';
      const tPath = `${i18nPrefix}.${fieldName}`;
      helper.field = helper.createField({
        i18nPrefix,
        name: fieldName,
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
        value: '',
      });
      sinon.stub(helper.i18n, 't')
        .withArgs(`${tPath}.customValueInputPlaceholder`)
        .returns('My custom prompt');

      await helper.render();

      expect(helper.customValueInput)
        .to.have.attr('placeholder', 'My custom prompt');
    }
  );

  it('renders custom text in custom value option if it is specified in i18n',
    async function () {
      const helper = new Helper(this);
      const i18nPrefix = 'somePrefix';
      const fieldName = 'field1';
      const tPath = `${i18nPrefix}.${fieldName}`;
      helper.field = helper.createField({
        i18nPrefix,
        name: fieldName,
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
      });
      sinon.stub(helper.i18n, 't')
        .withArgs(`${tPath}.customInputOptionTextPrefix`)
        .returns('My custom option');

      await helper.render();

      expect(helper.dropdown.getOptionByText('My custom option')).to.exist;
    }
  );

  it('notifies field object about change value to custom, which is an empty string by default',
    async function () {
      const helper = new Helper(this);
      helper.field = helper.createField({
        options: [
          { value: 1, label: 'First' },
          { value: 2, label: 'Second' },
        ],
        value: 1,
      });
      const valueChangedSpy = sinon.spy(helper.field, 'valueChanged');

      await helper.render();
      await helper.selectCustomValueOption();

      expect(valueChangedSpy).to.be.calledOnce;
      expect(valueChangedSpy).to.be.calledWith('');
    }
  );

  it('notifies field object about custom value change',
    async function () {
      const helper = new Helper(this);
      helper.field = helper.createField({
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
        value: '',
      });
      const valueChangedSpy = sinon.spy(helper.field, 'valueChanged');

      await helper.render();
      await fillIn(helper.customValueInput, 'hello');

      expect(valueChangedSpy).to.be.calledWith('hello');
    }
  );

  //#endregion

  //#region custom value features using field-renderer

  it('passes custom input value to form root group after selecting custom option and changing its text',
    async function () {
      const helper = new Helper(this);
      helper.field = helper.createField({
        name: 'customValueField',
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
      });

      await helper.renderUsingRenderer();
      await helper.selectCustomValueOption();
      await fillIn(helper.customValueInput, 'hello');

      expect(helper.rootGroup.dumpValue()).to.have.property('customValueField', 'hello');
    }
  );

  it('is rendered in group as invalid if custom value does not conform validation', async function () {
    const helper = new Helper(this);
    helper.field = helper.createField({
      name: 'customValueField',
      options: [
        { value: 'predefined', label: 'Predefined' },
      ],
      customValidators: [
        validator('format', {
          type: 'email',
          allowBlank: false,
        }),
      ],
    });
    await helper.renderUsingRenderer();

    await helper.selectCustomValueOption();
    await fillIn(helper.customValueInput, 'hello');

    const fieldMessage = helper.formGroupElement.querySelector('.field-message');
    expect(helper.formGroupElement).to.have.class('has-error');
    expect(fieldMessage).to.exist;
    expect(fieldMessage).to.have.trimmed.text('This field must be a valid email address');
  });

  it('is rendered in group as valid if custom value does conforms validation', async function () {
    const helper = new Helper(this);
    helper.field = helper.createField({
      name: 'customValueField',
      options: [
        { value: 'predefined', label: 'Predefined' },
      ],
      customValidators: [
        validator('format', {
          type: 'email',
          allowBlank: false,
        }),
      ],
    });
    await helper.renderUsingRenderer();

    await helper.selectCustomValueOption();
    await fillIn(helper.customValueInput, 'hello@world.com');

    expect(helper.formGroupElement).to.not.have.class('has-error');
    expect(helper.formGroupElement.querySelector('.field-message')).to.not.exist;
  });

  //#endregion
});

class Helper {
  constructor(mochaContext) {
    assert('mochaContext is mandatory', mochaContext);
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;
  }

  get i18n() {
    return lookupService(this.mochaContext, 'i18n');
  }
  get fieldElement() {
    return find('.field-component');
  }
  get options() {
    return findAll('.ember-power-select-option');
  }
  get customValueInput() {
    return find('.custom-value-dropdown-field-trigger .custom-option-input');
  }
  get rootGroup() {
    return FormFieldsRootGroup.create({
      ownerSource: this.mochaContext.owner,
      fields: [
        this.field,
      ],
    });
  }
  get formGroupElement() {
    return find(`.form-group.${this.field.name}-field`);
  }

  async selectCustomValueOption() {
    await this.dropdown.selectOptionByText('Custom value...');
  }

  createField(data) {
    return CustomValueDropdownField.create({
      ownerSource: this.mochaContext.owner,
      i18nPrefix: 'defaultPrefix',
      name: 'defaultField',
      options: [],
      ...data,
    });
  }

  async render() {
    if (!this.field) {
      this.field = this.createField();
    }
    if (!this.fieldId) {
      this.fieldId = 'default-field-id';
    }
    this.mochaContext.setProperties({
      field: this.field,
      fieldId: this.fieldId,
    });
    await render(hbs`{{form-component/custom-value-dropdown-field
      field=field
      fieldId=fieldId
    }}`);
    this.dropdown = new OneDropdownHelper('.custom-value-dropdown-field-trigger');
  }
  async renderUsingRenderer() {
    if (!this.field) {
      this.field = this.createField();
    }
    this.mochaContext.setProperties({
      rootGroup: this.rootGroup,
    });
    await render(hbs`{{form-component/field-renderer field=rootGroup}}`);
    this.dropdown = new OneDropdownHelper('.custom-value-dropdown-field-trigger');
  }
}
