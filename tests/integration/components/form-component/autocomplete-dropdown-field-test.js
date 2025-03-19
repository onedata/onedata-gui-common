import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, blur, focus, click, find, findAll, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AutocompleteDropdownField from 'onedata-gui-common/utils/form-component/autocomplete-dropdown-field';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import OneDropdownHelper from '../../../helpers/one-dropdown';
import { assert } from '@ember/debug';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';

describe('Integration | Component | form-component/autocomplete-dropdown-field', function () {
  const { afterEach } = setupRenderingTest();

  afterEach(function () {
    this.helper?.destroy();
  });

  it('has classes "dropdown-field" and "autocomplete-dropdown-field"', async function () {
    this.helper = new Helper(this);

    await this.helper.render();

    expect(this.helper.fieldElement).to.have.class('dropdown-field');
    expect(this.helper.fieldElement).to.have.class('autocomplete-dropdown-field');
  });

  it('renders predefined dropdown options', async function () {
    this.helper = new Helper(this);
    const i18nPrefix = 'somePrefix';
    const fieldName = 'field1';
    this.helper.field = this.helper.createField({
      i18nPrefix,
      name: fieldName,
      options: [
        { value: 'First', name: 'First', label: 'First' },
        { value: 'Second', name: 'Second', label: 'Second' },
        { value: 'Third', name: 'Third', label: 'Third' },
      ],
    });

    await this.helper.render();
    const options = await this.helper.dropdown.getOptions();

    const expected = ['First', 'Second', 'Third'];
    expected.forEach((label, index) => {
      const option = options[index];
      expect(option).to.have.trimmed.text(label);
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

  it('notifies field object about changed value',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        options: [
          { name: 'First', value: 'First', label: 'First' },
          { name: 'Second', value: 'Second', label: 'Second' },
          { name: 'Third', value: 'Third', label: 'Third' },
        ],
      });
      const valueChangedSpy = sinon.spy(this.helper.field, 'valueChanged');

      await this.helper.render();

      await this.helper.dropdown.selectOptionByText('Second');
      expect(valueChangedSpy).to.be.calledTwice;
      expect(valueChangedSpy).to.be.calledWith('Second');
    }
  );

  it('sets dropdown value to value specified in field object', async function () {
    this.helper = new Helper(this);
    this.helper.field = this.helper.createField({
      options: [
        { name: 'First', value: 'First', label: 'First' },
        { name: 'Second', value: 'Second', label: 'Second' },
        { name: 'Third', value: 'Third', label: 'Third' },
      ],
      defaultValue: 'Second',
    });

    await this.helper.renderUsingRenderer();
    expect(this.helper.customValueInput).to.have.value('Second');
  });

  it('sets input id according to "fieldId"', async function () {
    this.helper = new Helper(this);
    this.helper.fieldId = 'abc';

    await this.helper.render();
    expect(this.helper.dropdown.getTrigger()).to.have.attr('id', 'abc');

  });

  it('filters available options according to query in input', async function () {
    this.helper = new Helper(this);
    this.helper.field = this.helper.createField({
      options: [
        { name: 'Hello One', value: 'Hello One', label: 'Hello One' },
        { name: 'Hello Two', value: 'Hello Two', label: 'Hello Two' },
        { name: 'World One', value: 'World One', label: 'World One' },
        { name: 'World Two', value: 'World Two', label: 'World Two' },
      ],
    });
    await this.helper.renderUsingRenderer();

    await fillIn(this.helper.customValueInput, 'Two');

    const options = await this.helper.dropdown.getOptions();
    expect(options).to.have.lengthOf(2);
    expect(options[0]).to.have.trimmed.text('Hello Two');
    expect(options[1]).to.have.trimmed.text('World Two');
  });

  it('renders label of selected option when field is in "view" mode', async function () {
    this.helper = new Helper(this);
    this.helper.field = this.helper.createField({
      options: [
        { name: 'One', value: 1, label: 'One' },
        { name: 'Two', value: 2, label: 'Two' },
      ],
      value: 1,
    });
    this.helper.field.changeMode('view');

    await this.helper.render();

    expect(find('.text')).to.have.trimmed.text('One');
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

  it('renders "Enter value..." placeholder in custom value input by default',
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
        .to.have.attr('placeholder', 'Enter value...');
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
      await click(this.helper.customValueInput);
      await fillIn(this.helper.customValueInput, 'hello');

      expect(find('div.ember-power-select-option')).to.contain.text('hello');
    }
  );

  it('renders custom edited text in input after custom value input edit',
    async function () {
      this.helper = new Helper(this);
      this.helper.field = this.helper.createField({
        options: [
          { value: 'predefined', label: 'Predefined' },
        ],
      });
      await this.helper.renderUsingRenderer();
      await click(this.helper.customValueInput);
      await fillIn(this.helper.customValueInput, 'hello');
      await click(find('div.ember-power-select-option'));
      expect(this.helper.customValueInput).to.have.value('hello');
      expect(find('.ember-basic-dropdown')).to.not.exist;
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
    }
  );

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
      expect(this.helper.customValueInput).to.have.value('');
    }
  );
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
    return find('.autocomplete-dropdown-field-trigger .ember-power-select-search-input');
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

  destroy() {
    this.field?.destroy();
    this.rootGroupCache?.destroy();
  }

  createField(data) {
    return AutocompleteDropdownField.create({
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
    await render(hbs`{{form-component/autocomplete-dropdown-field
      field=field
      fieldId=fieldId
    }}`);
    this.dropdown = new OneDropdownHelper('.autocomplete-dropdown-field-trigger');
  }
  async renderUsingRenderer() {
    if (!this.field) {
      this.field = this.createField();
    }
    this.mochaContext.setProperties({
      rootGroup: this.rootGroup,
    });
    await render(hbs`{{form-component/field-renderer field=rootGroup}}`);
    this.dropdown = new OneDropdownHelper('.autocomplete-dropdown-field-trigger');
  }
}
