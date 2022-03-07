import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import MissingMessage from 'onedata-gui-common/utils/i18n/missing-message';
import { setProperties } from '@ember/object';
import OneTooltipHelper from '../../../helpers/one-tooltip';
import $ from 'jquery';

describe('Integration | Component | form component/field renderer', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.owner.register('util:i18n/missing-message', MissingMessage);
    this.set('textField', TextField.create({ ownerSource: this.owner }));
  });

  it('has classes "form-group field-renderer" by default', async function () {
    await render(hbs `{{form-component/field-renderer field=textField}}`);

    expect(this.$('.form-group.field-renderer')).to.exist;
  });

  it('renders passed field', async function () {
    await render(hbs `{{form-component/field-renderer field=textField}}`);

    expect(this.$('.text-like-field')).to.exist;
  });

  it('renders label if "label" is specified in field', async function () {
    this.set('textField.label', 'someLabel');

    await render(hbs `{{form-component/field-renderer field=textField}}`);

    const $label = this.$('label');
    expect($label.text().trim()).to.equal('someLabel:');
    expect($label.attr('for')).to.equal(this.$('input').attr('id'));
  });

  it('does not render label if "label" is not specified in field', async function () {
    await render(hbs `{{form-component/field-renderer field=textField}}`);

    expect(this.$('label')).to.not.exist;
  });

  it('has class "has-error" when field is not valid and is modified', async function () {
    this.get('textField').markAsModified();

    await render(hbs `{{form-component/field-renderer field=textField}}`);

    expect(this.$('.form-group')).to.have.class('has-error');
  });

  it(
    'does not have class "has-error" when field is not valid and is not modified',
    async function () {
      await render(hbs `{{form-component/field-renderer field=textField}}`);

      expect(this.$('.form-group')).to.not.have.class('has-error');
    }
  );

  it('has class "has-success" when field is valid and is modified', async function () {
    this.set('textField.value', 'a');
    this.get('textField').markAsModified();

    await render(hbs `{{form-component/field-renderer field=textField}}`);

    expect(this.$('.form-group')).to.have.class('has-success');
  });

  it(
    'does not have class "has-success" when field is valid and is not modified',
    async function () {
      this.set('textField.value', 'a');

      await render(hbs `{{form-component/field-renderer field=textField}}`);

      expect(this.$('.form-group')).to.not.have.class('has-success');
    }
  );

  it('renders error message when field is not valid and is modified', async function () {
    this.get('textField').markAsModified();

    await render(hbs `{{form-component/field-renderer field=textField}}`);

    expect(this.$('.field-message').text().trim()).to.equal(
      'This field can\'t be blank');
  });

  it(
    'does not render error message when field is not valid and is not modified',
    async function () {
      await render(hbs `{{form-component/field-renderer field=textField}}`);

      expect(this.$('.field-message')).to.not.exist;
    }
  );

  it(
    'does not render validation icon when field is not modified',
    async function () {
      await render(hbs `{{form-component/field-renderer field=textField}}`);

      expect(this.$('.form-control-feedback')).to.not.exist;
    }
  );

  it('renders error icon when field is not valid and is modified', async function () {
    this.get('textField').markAsModified();

    await render(hbs `{{form-component/field-renderer field=textField}}`);

    expect(this.$('.form-control-feedback.glyphicon-remove')).to.exist;
  });

  it('renders success icon when field is valid and is modified', async function () {
    this.set('textField.value', 'a');
    this.get('textField').markAsModified();

    await render(hbs `{{form-component/field-renderer field=textField}}`);

    expect(this.$('.form-control-feedback.glyphicon-ok')).to.exist;
  });

  it(
    'does not render validation icon when field is modified but it has falsy withValidationIcon',
    async function () {
      this.set('textField.withValidationIcon', false);
      this.get('textField').markAsModified();

      await render(hbs `{{form-component/field-renderer field=textField}}`);

      expect(this.$('.form-control-feedback')).to.not.exist;
    }
  );

  it(
    'has class "`field.name`-field" and "`field.fieldComponentName`-renderer',
    async function () {
      this.set('textField.name', 'field1');

      await render(hbs `{{form-component/field-renderer field=textField}}`);

      const $renderer = this.$('.field-renderer');
      expect($renderer).to.have.class('field1-field');
      expect($renderer).to.have.class('text-like-field-renderer');
    }
  );

  it(
    'has class passed via field.classes',
    async function () {
      this.set('textField.classes', 'abc');

      await render(hbs `{{form-component/field-renderer field=textField}}`);

      expect(this.$('.field-renderer')).to.have.class('abc');
    }
  );

  it(
    'does not add colon to label if field.addColonToLabel is false',
    async function () {
      setProperties(this.get('textField'), {
        addColonToLabel: false,
        label: 'abc',
      });

      await render(hbs `{{form-component/field-renderer field=textField}}`);

      expect(this.$('label').text().trim()).to.equal('abc');
    }
  );

  it(
    'renders tooltip if field.tip is not empty',
    async function () {
      this.set('textField.tip', 'someTip');

      await render(hbs `{{form-component/field-renderer field=textField}}`);

      const $formFieldTip = this.$('.form-field-tip');
      expect($formFieldTip).to.exist;
      return new OneTooltipHelper($formFieldTip.find('.one-icon')[0]).getText()
        .then(text => expect(text).to.equal('someTip'));
    }
  );

  it(
    'does not render tooltip if field.tip is empty',
    async function () {
      this.set('textField.tip', undefined);

      await render(hbs `{{form-component/field-renderer field=textField}}`);

      expect(this.$('.form-field-tip')).to.not.exist;
    }
  );

  it('adds classname to tooltip if field.tooltipClass is specified',
    async function (done) {
      this.set('textField.tip', 'someTip');
      this.set('textField.tooltipClass', 'custom-tooltip-class');

      await render(hbs `{{form-component/field-renderer field=textField}}`);

      const $formFieldTip = this.$('.form-field-tip');
      expect($formFieldTip).to.exist;
      const tooltipHelper = new OneTooltipHelper($formFieldTip.find('.one-icon')[0]);
      await tooltipHelper.open();
      const $tooltip = $(tooltipHelper.getTooltip());
      expect($tooltip).to.have.class('custom-tooltip-class');

      done();
    }
  );

  [
    'view',
    'edition',
    'mixed',
  ].forEach(mode => {
    it(`has class field-${mode}-mode when field is in "${mode}" mode`, async function () {
      this.get('textField').changeMode(mode);

      await render(hbs `{{form-component/field-renderer field=textField}}`);

      expect(this.$('.field-renderer')).to.have.class(`field-${mode}-mode`);
    });
  });

  it('has class "field-enabled" when field is enabled', async function () {
    this.set('textField.isEnabled', true);

    await render(hbs `{{form-component/field-renderer field=textField}}`);

    expect(this.$('.field-renderer')).to.have.class('field-enabled')
      .and.to.not.have.class('field-disabled');
  });

  it('has class "field-disabled" when field is disabled', async function () {
    this.set('textField.isEnabled', false);

    await render(hbs `{{form-component/field-renderer field=textField}}`);

    expect(this.$('.field-renderer')).to.have.class('field-disabled')
      .and.to.not.have.class('field-enabled');
  });
});
