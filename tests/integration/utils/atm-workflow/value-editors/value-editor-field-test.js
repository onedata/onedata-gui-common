import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import {
  find,
  findAll,
  fillIn,
  render,
  click,
  settled,
} from '@ember/test-helpers';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import {
  ValueEditorField,
  formValueToRawValue,
  rawValueToFormValue,
} from 'onedata-gui-common/utils/atm-workflow/value-editors/value-editor-field';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { set } from '@ember/object';

describe('Integration | Utility | atm-workflow/value-editors/value-editor-field', function () {
  setupRenderingTest();

  beforeEach(function () {
    const field = ValueEditorField.create({
      name: 'valueEditor',
      atmDataSpec: {
        type: AtmDataSpecType.Number,
      },
    });
    this.setProperties({
      field,
      rootGroup: FormFieldsRootGroup.create({
        ownerSource: this.owner,
        fields: [field],
      }),
    });
  });

  context('in edit mode', function () {
    it('renders component with class "value-editor"', async function (done) {
      await renderForm();

      expect(find('.value-editor')).to.exist;
      done();
    });

    it('shows editor with default when field has undefined value', async function () {
      await renderForm();

      expect(find('.number-editor input')).to.exist.and.to.have.value('0');
    });

    it('shows empty editor when field has empty value', async function () {
      setRawValue(this, null, true);

      await renderForm();

      expect(find('.number-editor input')).to.exist.and.to.have.value('');
    });

    it('shows editor with correct data when field has some value', async function () {
      setRawValue(this, 10);

      await renderForm();

      expect(find('.number-editor input')).to.exist.and.to.have.value('10');
    });

    it('shows creator button when "isOptional" is true and field has empty value',
      async function () {
        this.set('field.isOptional', true);
        setRawValue(this, null, true);

        await renderForm();

        const creatorBtn = find('.create-value-btn');
        expect(creatorBtn).to.exist;
        expect(creatorBtn).to.have.trimmed.text('Set value');
      }
    );

    it('allows to use custom text in creator button by overriding "valueCreatorButtonLabel"',
      async function () {
        this.set('field.isOptional', true);
        this.set('field.valueCreatorButtonLabel', 'abc');
        setRawValue(this, null, true);

        await renderForm();

        expect(find('.create-value-btn')).to.have.trimmed.text('abc');
      }
    );

    it('assigns an empty value after click on creator button', async function () {
      this.set('field.isOptional', true);
      setRawValue(this, null, true);
      await renderForm();

      await click('.create-value-btn');

      expect(find('.create-value-btn')).to.not.exist;
      expect(find('.full-value-editor')).to.exist;
      expect(find('.number-editor input')).to.exist.and.to.have.value('0');
      expect(getRawValue(this)).to.equal(0);
    });

    it('removes value and it\'s editor after click on remove button', async function () {
      this.set('field.isOptional', true);
      setRawValue(this, 0);
      await renderForm();

      await click('.remove-icon');

      expect(find('.full-value-editor')).to.not.exist;
      expect(find('.create-value-btn')).to.exist;
      expect(getRawValue(this)).to.equal(null);
    });

    it('does not allow to remove value if field is not optional', async function () {
      setRawValue(this, 0);

      await renderForm();

      expect(find('.remove-icon')).to.not.exist;
    });

    it('can be disabled and enabled', async function () {
      await renderForm();

      this.set('rootGroup.isEnabled', false);
      await settled();

      expect(find('input')).to.have.attr('disabled');

      this.set('rootGroup.isEnabled', true);
      await settled();

      expect(find('input')).to.not.have.attr('disabled');
    });

    it('can be disabled and enabled when showing creator button', async function () {
      this.set('field.isOptional', true);
      setRawValue(this, null, true);
      await renderForm();

      this.set('rootGroup.isEnabled', false);
      await settled();

      expect(find('button')).to.have.attr('disabled');

      this.set('rootGroup.isEnabled', true);
      await settled();

      expect(find('button')).to.not.have.attr('disabled');
    });

    it('propagates new value and validation state from nested editor', async function () {
      this.set('field.atmDataSpec', {
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: AtmDataSpecType.Number,
          },
        },
      });
      await renderForm();

      await click('.add-item-trigger');
      await fillIn('input', '');

      expect(getRawValue(this)).to.deep.equal([NaN]);
      expect(this.field.isValid).to.be.false;

      await fillIn('input', '123');

      expect(getRawValue(this)).to.deep.equal([123]);
      expect(this.field.isValid).to.be.true;
    });
  });

  context('in view mode', function () {
    beforeEach(function () {
      this.get('rootGroup').changeMode('view');
    });

    it('is rendered as disabled editor', async function () {
      await renderForm();

      expect(findAll('input').length).to.equal(findAll('input[disabled]').length)
        .and.to.be.gt(0);
    });

    it('shows passed value', async function () {
      setRawValue(this, 10);

      await renderForm();

      expect(find('.number-editor input')).to.exist.and.to.have.value('10');
    });
  });
});

async function renderForm() {
  await render(hbs `{{form-component/field-renderer field=rootGroup}}`);
}

function getRawValue(testCase) {
  return formValueToRawValue(testCase.get('rootGroup').dumpValue().valueEditor);
}

function setRawValue(testCase, rawValue, allowEmpty = false) {
  const rootGroup = testCase.get('rootGroup');
  rootGroup.reset();
  set(rootGroup, 'valuesSource.valueEditor', rawValueToFormValue(rawValue, allowEmpty));
}
