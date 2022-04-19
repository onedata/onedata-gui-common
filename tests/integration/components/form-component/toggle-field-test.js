import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, focus, blur, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import sinon from 'sinon';

describe('Integration | Component | form component/toggle field', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('field', ToggleField.create());
  });

  it(
    'has class "toggle-field"',
    async function () {
      await render(hbs `{{form-component/toggle-field field=field}}`);

      expect(find('.toggle-field')).to.exist;
    }
  );

  it(
    'renders toggle',
    async function () {
      await render(hbs `{{form-component/toggle-field field=field}}`);

      expect(find('.one-way-toggle')).to.exist;
    }
  );

  it(
    'can be disabled',
    async function () {
      this.set('field.isEnabled', false);

      await render(hbs `{{form-component/toggle-field field=field}}`);

      expect(find('.one-way-toggle')).to.have.class('disabled');
    }
  );

  it(
    'notifies field object about lost focus',
    async function () {
      const focusLostSpy = sinon.spy(this.get('field'), 'focusLost');

      await render(hbs `{{form-component/toggle-field field=field}}`);

      return focus('input')
        .then(() => blur('input'))
        .then(() => expect(focusLostSpy).to.be.calledOnce);
    }
  );

  it(
    'notifies field object about changed value',
    async function () {
      const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');

      await render(hbs `{{form-component/toggle-field field=field}}`);

      return click('.one-way-toggle')
        .then(() => {
          expect(valueChangedSpy).to.be.calledOnce;
          expect(valueChangedSpy).to.be.calledWith(true);
        });
    }
  );

  it('sets input value to value specified in field object', async function () {
    this.set('field.value', true);

    await render(hbs `{{form-component/toggle-field field=field}}`);

    expect(find('.one-way-toggle')).to.have.class('checked');
  });

  it('sets input id according to "fieldId"', async function () {
    await render(hbs `
      {{form-component/toggle-field field=field fieldId="abc"}}
    `);

    expect(find('input#abc')).to.exist;
  });

  it('renders blocked toggle when field is in "view" mode', async function () {
    this.get('field').changeMode('view');

    await render(hbs `{{form-component/toggle-field field=field}}`);

    expect(find('.one-way-toggle')).to.have.class('disabled');
  });
});
