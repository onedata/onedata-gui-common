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
  const { afterEach } = setupRenderingTest();

  afterEach(function () {
    this.helper?.destroy();
  });

  //#region standard dropdown features

  it('has classes "dropdown-field" and "custom-value-dropdown-field"', async function () {
    this.helper = new Helper(this);

    await this.helper.render();

    expect(this.helper.fieldElement).to.have.class('dropdown-field');
    expect(this.helper.fieldElement).to.have.class('custom-value-dropdown-field');
  });

  it('renders predefined dropdown options with labels and optional icons', async function () {
    this.helper = new Helper(this);
    const i18nPrefix = 'somePrefix';
    const fieldName = 'field1';
    const tPath = `${i18nPrefix}.${fieldName}`;
    this.helper.field = this.helper.createField({
      i18nPrefix,
      name: fieldName,
      options: [
        { value: 1, name: 'first', icon: 'space' },
        { value: 2, name: 'second' },
        { value: 3, name: 'third' },
      ],
    });
    sinon.stub(this.helper.i18n, 't')
      .withArgs(`${tPath}.options.first.label`)
      .returns('First')
      .withArgs(`${tPath}.options.second.label`)
      .returns('Second')
      .withArgs(`${tPath}.options.third.label`)
      .returns('Third');

    await this.helper.render();
    const options = await this.helper.dropdown.getOptions();

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
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        isEnabled: false,
      });

      await this.helper.render();

      expect(this.helper.dropdown.getTrigger()).to.have.attr('aria-disabled', 'true');
    }
  );

  it('notifies field object about lost focus',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField();
      const focusLostSpy = sinon.spy(this.helper.field, 'focusLost');

      await this.helper.render();
      const trigger = this.helper.dropdown.getTrigger();
      await focus(trigger);
      await blur(trigger);

      expect(focusLostSpy).to.be.calledOnce;
    }
  );

  it('notifies field object about changed value',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        options: [
          { value: 1, label: 'First' },
          { value: 2, label: 'Second' },
          { value: 3, label: 'Third' },
        ],
      });
      const valueChangedSpy = sinon.spy(this.helper.field, 'valueChanged');

      await this.helper.render();
      await this.helper.dropdown.selectOptionByText('Second');

      expect(valueChangedSpy).to.be.calledOnce;
      expect(valueChangedSpy).to.be.calledWith(2);
    }
  );

  it('sets dropdown value to value specified in field object', async function () {
    this.helper = new Helper(this);
    this.helper.field = this.helper.createField({
      options: [
        { value: 1, label: 'First' },
        { value: 2, label: 'Second' },
        { value: 3, label: 'Third' },
      ],
      value: 2,
    });

    await this.helper.render();

    expect(this.helper.dropdown.getSelectedOptionText()).to.equal('Second');
  });

  it('sets input id according to "fieldId"', async function () {
    this.helper = new Helper(this);
    this.helper.fieldId = 'abc';

    await this.helper.render();

    expect(this.helper.dropdown.getTrigger()).to.have.attr('id', 'abc');

  });

  it('shows placeholder specified in field', async function () {
    this.helper = new Helper(this);
    const i18nPrefix = 'somePrefix';
    const fieldName = 'field1';
    const tPath = `${i18nPrefix}.${fieldName}`;
    this.helper.field = this.helper.createField({
      i18nPrefix: 'somePrefix',
      name: 'field1',
    });
    sinon.stub(this.helper.i18n, 't')
      .withArgs(`${tPath}.placeholder`)
      .returns('Test placeholder');

    await this.helper.render();

    expect(this.helper.dropdown.getPlaceholder()).to.equal('Test placeholder');
  });

  it('does not show search input by default',
    async function () {
      this.helper = new Helper(this);

      await this.helper.render();

      expect(await this.helper.dropdown.getSearchInput()).to.not.exist;
    }
  );

  it('shows search input if configured',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        showSearch: true,
        options: [
          { name: 'single', value: 1, label: 'Single option' },
        ],
      });

      await this.helper.render();

      expect(await this.helper.dropdown.getSearchInput()).to.exist;
    }
  );

  it('filters available options according to query in search input', async function () {
    this.helper = new Helper(this);
    this.helper.field = this.helper.createField({
      showSearch: true,
      options: [
        { name: 'hello-one', value: 'hello-one', label: 'Hello One' },
        { name: 'hello-two', value: 'hello-two', label: 'Hello Two' },
        { name: 'world-one', value: 'world-one', label: 'World One' },
        { name: 'world-two', value: 'world-two', label: 'World Two' },
      ],
    });
    await this.helper.render();

    await this.helper.dropdown.fillInSearchInput('Two');

    const options = await this.helper.dropdown.getOptions();
    expect(options).to.have.lengthOf(2);
    expect(options[0]).to.have.trimmed.text('Hello Two');
    expect(options[1]).to.have.trimmed.text('World Two');
  });

  it('renders raw icon and label of selected option when field is in "view" mode', async function () {
    this.helper = new Helper(this);
    this.helper.field = this.helper.createField({
      options: [
        { name: 'one', value: 1, label: 'One', icon: 'space' },
        { name: 'two', value: 2, label: 'Two', icon: 'provider' },
      ],
      value: 1,
    });
    this.helper.field.changeMode('view');

    await this.helper.render();

    expect(find('.text')).to.have.trimmed.text('One');
    expect(find('.one-icon')).to.have.class('oneicon-space');
    expect(find('.ember-basic-dropdown')).to.not.exist;
  });

  it('does not apply "small" class to trigger and dropdown when "size" is "md"', async function () {
    this.helper = new Helper(this);
    this.helper.field = this.helper.createField({
      options: [
        { name: 'one', value: 1, label: 'One' },
        { name: 'two', value: 2, label: 'Two' },
      ],
      size: 'md',
    });

    await this.helper.render();
    await this.helper.dropdown.open();

    await expect(this.helper.dropdown.getTrigger()).to.not.have.class('small');
    expect(find('.ember-basic-dropdown-content'))
      .to.not.have.class('small');
  });

  //#endregion

  //#region custom value features

  it('renders special custom value option after predefined options', async function () {
    this.helper = new Helper(this);
    const options = [
      { value: 1, name: 'first', label: 'First' },
      { value: 2, name: 'second', label: 'Second' },
    ];
    this.helper.field = this.helper.createField({
      i18nPrefix: 'somePrefix',
      name: 'field1',
      options,
    });

    await this.helper.render();
    const renderedOptions = await this.helper.dropdown.getOptions();

    const expected = [
      { label: 'First' },
      { label: 'Second' },
      { label: Helper.customValueOptionLabel },
    ];
    expected.forEach(({ label }, index) => {
      const option = renderedOptions[index];
      expect(option.querySelector('.text:not(input)')).to.have.trimmed.text(label);
    });
  });

  it('renders input in selector trigger when custom value is selected',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
        value: '',
      });

      await this.helper.render();

      expect(this.helper.customValueInput).to.exist;
      expect(this.helper.customValueInput.value).to.equal('');
    }
  );

  it('does not render custom value input in selector trigger if the custom option is not selected',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
        value: 'predefined',
      });

      await this.helper.render();

      expect(this.helper.customValueInput).to.not.exist;
    }
  );

  it('renders trigger as active if custom value input is focused',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
        value: '',
      });

      await this.helper.render();
      await focus(this.helper.customValueInput);

      expect(this.helper.dropdown.getTrigger())
        .to.have.class('ember-power-select-trigger--active');
    }
  );

  it('renders "Enter custom value..." placeholder in custom value input by default',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
        value: '',
      });

      await this.helper.render();

      expect(this.helper.customValueInput)
        .to.have.attr('placeholder', 'Enter custom value...');
    }
  );

  it('renders custom edited text in dropdown option after custom value input edit',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
        value: '',
      });
      await this.helper.render();

      await fillIn(this.helper.customValueInput, 'hello');
      const customValueOption = await this.helper.getCustomValueOption();

      expect(customValueOption).to.contain.text('hello');
    }
  );

  it('renders custom placeholder in custom value input if it is specified in i18n',
    async function () {
      this.helper = new Helper(this);
      const i18nPrefix = 'somePrefix';
      const fieldName = 'field1';
      const tPath = `${i18nPrefix}.${fieldName}`;
      this.helper.field = this.helper.createField({
        i18nPrefix,
        name: fieldName,
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
        value: '',
      });
      sinon.stub(this.helper.i18n, 't')
        .withArgs(`${tPath}.customValueInputPlaceholder`)
        .returns('My custom prompt');

      await this.helper.render();

      expect(this.helper.customValueInput)
        .to.have.attr('placeholder', 'My custom prompt');
    }
  );

  it('renders custom text in custom value option if it is specified in i18n',
    async function () {
      this.helper = new Helper(this);
      const i18nPrefix = 'somePrefix';
      const fieldName = 'field1';
      const tPath = `${i18nPrefix}.${fieldName}`;
      this.helper.field = this.helper.createField({
        i18nPrefix,
        name: fieldName,
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
      });
      sinon.stub(this.helper.i18n, 't')
        .withArgs(`${tPath}.customValueOptionTextPrefix`)
        .returns('My custom option');

      await this.helper.render();

      expect(this.helper.dropdown.getOptionByText('My custom option')).to.exist;
    }
  );

  it('notifies field object about change value to custom, which is an empty string by default',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        options: [
          { value: 1, label: 'First' },
          { value: 2, label: 'Second' },
        ],
        value: 1,
      });
      const valueChangedSpy = sinon.spy(this.helper.field, 'valueChanged');

      await this.helper.render();
      await this.helper.selectCustomValueOption();

      expect(valueChangedSpy).to.be.calledOnce;
      expect(valueChangedSpy).to.be.calledWith('');
    }
  );

  it('notifies field object about custom value change',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
        value: '',
      });
      const valueChangedSpy = sinon.spy(this.helper.field, 'valueChanged');

      await this.helper.render();
      await fillIn(this.helper.customValueInput, 'hello');

      expect(valueChangedSpy).to.be.calledWith('hello');
    }
  );

  it('renders "rename" icon by default for custom option in trigger and dropdown if icon is enabled',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        options: [
          { name: 'predefined', value: 1, label: 'predefined', icon: 'space' },
        ],
        value: '',
        isCustomInputOptionIconShown: true,
      });

      await this.helper.render();
      const trigger = await this.helper.dropdown.getTrigger();
      const customValueOption = await this.helper.getCustomValueOption();

      expect(trigger.querySelector('.one-icon')).to.have.class('oneicon-browser-rename');
      expect(customValueOption.querySelector('.one-icon'))
        .to.have.class('oneicon-browser-rename');
    }
  );

  it('renders user-defined icon for custom option in trigger and dropdown if icon is enabled and customized',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        options: [
          { name: 'predefined', value: 1, label: 'predefined', icon: 'space' },
        ],
        value: '',
        isCustomInputOptionIconShown: true,
        customValueOptionIcon: 'warning',
      });

      await this.helper.render();
      const trigger = await this.helper.dropdown.getTrigger();
      const customValueOption = await this.helper.getCustomValueOption();

      expect(trigger.querySelector('.one-icon')).to.have.class('oneicon-warning');
      expect(customValueOption.querySelector('.one-icon'))
        .to.have.class('oneicon-warning');
    }
  );

  it('does not render icon for custom option in trigger and dropdown if icon is customized but disabled',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        options: [
          { name: 'predefined', value: 1, label: 'predefined', icon: 'space' },
        ],
        value: '',
        isCustomInputOptionIconShown: false,
        customValueOptionIcon: 'warning',
      });

      await this.helper.render();
      const trigger = await this.helper.dropdown.getTrigger();
      const customValueOption = await this.helper.getCustomValueOption();

      expect(trigger.querySelector('.one-icon')).to.not.exist;
      expect(customValueOption.querySelector('.one-icon')).to.not.exist;
    }
  );

  it('renders custom icon and custom text when field is in "view" mode and there is no option for value',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        options: [
          { name: 'one', value: 1, label: 'One', icon: 'space' },
          { name: 'two', value: 2, label: 'Two', icon: 'provider' },
        ],
        value: 'Some custom value',
        isCustomInputOptionIconShown: true,
        customValueOptionIcon: 'browser-file',
      });
      this.helper.field.changeMode('view');

      await this.helper.render();

      expect(find('.text')).to.have.trimmed.text('Some custom value');
      expect(find('.one-icon')).to.have.class('oneicon-browser-file');
      expect(find('.ember-basic-dropdown')).to.not.exist;
    }
  );

  //#endregion

  //#region custom value features using field-renderer

  it('passes custom input value to form root group after selecting custom option and changing its text',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        name: 'customValueField',
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
      });

      await this.helper.renderUsingRenderer();
      await this.helper.selectCustomValueOption();
      await fillIn(this.helper.customValueInput, 'hello');

      expect(this.helper.rootGroup.dumpValue()).to.have.property('customValueField', 'hello');
    }
  );

  it('is rendered in group as invalid if custom value does not conform validation', async function () {
    this.helper = new Helper(this);
    this.helper.field = this.helper.createField({
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
    await this.helper.renderUsingRenderer();

    await this.helper.selectCustomValueOption();
    await fillIn(this.helper.customValueInput, 'hello');

    const fieldMessage = this.helper.formGroupElement.querySelector('.field-message');
    expect(this.helper.formGroupElement).to.have.class('has-error');
    expect(fieldMessage).to.exist;
    expect(fieldMessage).to.have.trimmed.text('This field must be a valid email address');
  });

  it('is rendered in group as valid if custom value does conforms validation', async function () {
    this.helper = new Helper(this);
    this.helper.field = this.helper.createField({
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
    await this.helper.renderUsingRenderer();

    await this.helper.selectCustomValueOption();
    await fillIn(this.helper.customValueInput, 'hello@world.com');

    expect(this.helper.formGroupElement).to.not.have.class('has-error');
    expect(this.helper.formGroupElement.querySelector('.field-message')).to.not.exist;
  });

  it('restores custom-edited value in input after other option is selected and custom option is selected again',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        name: 'customValueField',
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
      });

      await this.helper.renderUsingRenderer();
      await this.helper.selectCustomValueOption();
      await fillIn(this.helper.customValueInput, 'hello');
      await this.helper.dropdown.selectOptionByText('Predefined');
      await this.helper.selectCustomValueOption();

      expect(this.helper.customValueInput).to.have.value('hello');
    }
  );

  it('has custom value option selected with value filled in if non-predefined value if specified in field',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        name: 'customValueField',
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
        value: 'hello',
      });

      await this.helper.renderUsingRenderer();

      expect(this.helper.customValueInput).to.have.value('hello');
      const customValueOption = await this.helper.getCustomValueOption();
      expect(customValueOption).to.exist;
      expect(customValueOption.textContent).to.contain(Helper.customValueOptionLabel);
      expect(customValueOption.textContent).to.contain('hello');
    }
  );

  it('filters available options including empty custom value option according to query in search input',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        showSearch: true,
        options: [
          { name: 'hello-one', value: 'hello-one', label: 'Hello One' },
          { name: 'hello-two', value: 'hello-two', label: 'Hello Custom' },
          { name: 'world-one', value: 'world-one', label: 'World One' },
          { name: 'world-two', value: 'world-two', label: 'World Custom' },
        ],
      });
      await this.helper.render();

      await this.helper.dropdown.fillInSearchInput('custom');

      const options = await this.helper.dropdown.getOptions();
      expect(options).to.have.lengthOf(3);
      expect(options[0]).to.have.trimmed.text('Hello Custom');
      expect(options[1]).to.have.trimmed.text('World Custom');
      expect(options[2]).to.have.trimmed.text('Custom value...');
    });

  it('has none option selected and reports no value if value is not set',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        name: 'customValueField',
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
      });

      await this.helper.renderUsingRenderer();

      expect(this.helper.dropdown.getSelectedOptionText()).to.be.null;
      expect(this.helper.customValueInput).to.not.exist;
      const values = this.helper.rootGroup.dumpValue();
      expect(values).to.have.property('customValueField');
      expect(values.customValueField).to.be.undefined;
    }
  );

  it('has custom option still selected, if custom value equals one of predefined options',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        name: 'customValueField',
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
      });

      await this.helper.renderUsingRenderer();
      await this.helper.selectCustomValueOption();
      await fillIn(this.helper.customValueInput, 'predefined');

      expect(this.helper.customValueInput).to.exist;
    }
  );

  it('allows to select predefined option with the same value as custom value',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        name: 'customValueField',
        options: [
          { value: 'predefined_value', label: 'Predefined label' },
        ],
      });

      await this.helper.renderUsingRenderer();
      await this.helper.selectCustomValueOption();
      await fillIn(this.helper.customValueInput, 'predefined_value');
      await this.helper.dropdown.selectOptionByText('Predefined label');

      expect(this.helper.dropdown.getSelectedOptionText()).to.equal('Predefined label');
    }
  );

  //#endregion
});

class Helper {
  static get customValueOptionLabel() {
    return 'Custom value...';
  }

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
    return find('.custom-value-dropdown-field-trigger .custom-value-trigger-input');
  }
  get rootGroup() {
    if (!this.rootGroupCache) {
      this.rootGroupCache = FormFieldsRootGroup.create({
        ownerSource: this.mochaContext.owner,
        fields: [
          this.field,
        ],
      });
    }
    return this.rootGroupCache;
  }
  get formGroupElement() {
    return find(`.form-group.${this.field.name}-field`);
  }

  async getCustomValueOption() {
    return await this.dropdown.getOptionByText(Helper.customValueOptionLabel);
  }
  async selectCustomValueOption() {
    await this.dropdown.selectOptionByText(Helper.customValueOptionLabel);
  }

  destroy() {
    this.field?.destroy();
    this.rootGroupCache?.destroy();
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
