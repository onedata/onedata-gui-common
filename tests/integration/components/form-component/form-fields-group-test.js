import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';

describe('Integration | Component | form component/form fields group', function () {
  setupComponentTest('form-component/form-fields-group', {
    integration: true,
  });

  it('renders list of fields', function () {
    this.set('fields', FormFieldsGroup.create({
      fields: [
        TextField.create({ ownerSource: this }),
        TextField.create({ ownerSource: this }),
      ],
    }));

    this.render(hbs `{{form-component/form-fields-group field=fields}}`);

    expect(this.$('.text-like-field')).to.have.length(2);
  });

  it('renders expanded fields group, when field.isExpanded is true', function () {
    this.set('fields', FormFieldsGroup.create());
    this.render(hbs `{{form-component/form-fields-group field=fields}}`);

    expect(this.$('.fields-group-collapse')).to.have.class('in');
  });

  it('renders collapsed fields group, when field.isExpanded is false', function () {
    this.set('fields', FormFieldsGroup.create({
      isExpanded: false,
    }));
    this.render(hbs `{{form-component/form-fields-group field=fields}}`);

    expect(this.$('.fields-group-collapse'))
      .to.not.have.class('in');
  });
});
