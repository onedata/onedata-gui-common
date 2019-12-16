import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import MissingMessage from 'onedata-gui-common/utils/i18n/missing-message';
import { setProperties } from '@ember/object';

describe('Integration | Component | form component/field renderer', function () {
  setupComponentTest('form-component/field-renderer', {
    integration: true,
  });

  beforeEach(function () {
    this.register('util:i18n/missing-message', MissingMessage);
    this.set('textField', TextField.create({ ownerSource: this }));
  });

  it('has classes "form-group field-renderer" by default', function () {
    this.render(hbs `{{form-component/field-renderer field=textField}}`);

    expect(this.$('.form-group.field-renderer')).to.exist;
  });

  it('renders passed field', function () {
    this.render(hbs `{{form-component/field-renderer field=textField}}`);

    expect(this.$('.text-like-field')).to.exist;
  });

  it('renders label if "label" is specified in field', function () {
    this.set('textField.label', 'someLabel');

    this.render(hbs `{{form-component/field-renderer field=textField}}`);

    const $label = this.$('label');
    expect($label.text().trim()).to.equal('someLabel:');
    expect($label.attr('for')).to.equal(this.$('input').attr('id'));
  });

  it('does not render label if "label" is not specified in field', function () {
    this.render(hbs `{{form-component/field-renderer field=textField}}`);

    expect(this.$('label')).to.not.exist;
  });

  it('has class "has-error" when field is not valid and is modified', function () {
    this.get('textField').markAsModified();

    this.render(hbs `{{form-component/field-renderer field=textField}}`);

    expect(this.$('.form-group')).to.have.class('has-error');
  });

  it(
    'does not have class "has-error" when field is not valid and is not modified',
    function () {
      this.render(hbs `{{form-component/field-renderer field=textField}}`);

      expect(this.$('.form-group')).to.not.have.class('has-error');
    }
  );

  it('has class "has-success" when field is valid and is modified', function () {
    this.set('textField.value', 'a');
    this.get('textField').markAsModified();

    this.render(hbs `{{form-component/field-renderer field=textField}}`);

    expect(this.$('.form-group')).to.have.class('has-success');
  });

  it(
    'does not have class "has-success" when field is valid and is not modified',
    function () {
      this.set('textField.value', 'a');

      this.render(hbs `{{form-component/field-renderer field=textField}}`);

      expect(this.$('.form-group')).to.not.have.class('has-success');
    }
  );

  it('renders error message when field is not valid and is modified', function () {
    this.get('textField').markAsModified();

    this.render(hbs `{{form-component/field-renderer field=textField}}`);

    expect(this.$('.field-message').text().trim()).to.equal(
      'This field can\'t be blank');
  });

  it(
    'does not render error message when field is not valid and is not modified',
    function () {
      this.render(hbs `{{form-component/field-renderer field=textField}}`);

      expect(this.$('.field-message')).to.not.exist;
    }
  );

  it(
    'does not render validation icon when field is not modified',
    function () {
      this.render(hbs `{{form-component/field-renderer field=textField}}`);

      expect(this.$('.form-control-feedback')).to.not.exist;
    }
  );

  it('renders error icon when field is not valid and is modified', function () {
    this.get('textField').markAsModified();

    this.render(hbs `{{form-component/field-renderer field=textField}}`);

    expect(this.$('.form-control-feedback.glyphicon-remove')).to.exist;
  });

  it('renders success icon when field is valid and is modified', function () {
    this.set('textField.value', 'a');
    this.get('textField').markAsModified();

    this.render(hbs `{{form-component/field-renderer field=textField}}`);

    expect(this.$('.form-control-feedback.glyphicon-ok')).to.exist;
  });

  it(
    'does not render validation icon when field is modified but it has falsy withValidationIcon',
    function () {
      this.set('textField.withValidationIcon', false);
      this.get('textField').markAsModified();

      this.render(hbs `{{form-component/field-renderer field=textField}}`);

      expect(this.$('.form-control-feedback')).to.not.exist;
    }
  );

  it(
    'has class "`field.name`-field" and "`field.fieldComponentName`-renderer',
    function () {
      this.set('textField.name', 'field1');

      this.render(hbs `{{form-component/field-renderer field=textField}}`);

      const $renderer = this.$('.field-renderer');
      expect($renderer).to.have.class('field1-field');
      expect($renderer).to.have.class('text-like-field-renderer');
    }
  );

  it(
    'has class passed via field.classes',
    function () {
      this.set('textField.classes', 'abc');

      this.render(hbs `{{form-component/field-renderer field=textField}}`);

      expect(this.$('.field-renderer')).to.have.class('abc');
    }
  );

  it(
    'does not add colon to label if field.addColonToLabel is false',
    function () {
      setProperties(this.get('textField'), {
        addColonToLabel: false,
        label: 'abc',
      });

      this.render(hbs `{{form-component/field-renderer field=textField}}`)

      expect(this.$('label').text().trim()).to.equal('abc');
    }
  );
});
