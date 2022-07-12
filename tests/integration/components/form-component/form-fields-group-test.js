import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';

describe('Integration | Component | form component/form fields group', function () {
  setupRenderingTest();

  it('renders list of fields', async function () {
    this.set('fields', FormFieldsGroup.create({
      fields: [
        TextField.create({ ownerSource: this.owner }),
        TextField.create({ ownerSource: this.owner }),
      ],
    }));

    await render(hbs `{{form-component/form-fields-group field=fields}}`);

    expect(findAll('.text-like-field')).to.have.length(2);
  });

  it('renders expanded fields group, when field.isExpanded is true', async function () {
    this.set('fields', FormFieldsGroup.create());
    await render(hbs `{{form-component/form-fields-group field=fields}}`);

    expect(find('.fields-group-collapse')).to.have.class('in');
  });

  it('renders collapsed fields group, when field.isExpanded is false', async function () {
    this.set('fields', FormFieldsGroup.create({
      isExpanded: false,
    }));
    await render(hbs `{{form-component/form-fields-group field=fields}}`);

    expect(find('.fields-group-collapse')).to.not.have.class('in');
  });
});
