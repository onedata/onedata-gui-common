import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, focus, blur, find, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AceField from 'onedata-gui-common/utils/form-component/ace-field';
import sinon from 'sinon';
import { replaceEmberAceWithTextarea } from '../../../helpers/ember-ace';

describe('Integration | Component | form-component/ace-field', function () {
  setupRenderingTest();

  beforeEach(function () {
    replaceEmberAceWithTextarea(this);
    this.set('field', AceField.create());
  });

  it('has class "ace-field"', async function () {
    await render(hbs `{{form-component/ace-field field=field}}`);

    expect(find('.ace-field')).to.exist;
  });

  it('renders ace editor', async function () {
    await render(hbs `{{form-component/ace-field field=field}}`);

    // We are checking for textarea element, as it is a replacement of ember-ace
    // in this test suite. See `replaceEmberAceWithTextarea` function.
    expect(find('textarea')).to.exist;
  });

  it('can be disabled', async function () {
    this.set('field.isEnabled', false);

    await render(hbs `{{form-component/ace-field field=field}}`);

    expect(find('textarea')).to.have.attr('disabled');
  });

  it('notifies field object about lost focus', async function () {
    const focusLostSpy = sinon.spy(this.field, 'focusLost');
    await render(hbs `{{form-component/ace-field field=field}}`);

    await focus('textarea');
    await blur('textarea');

    expect(focusLostSpy).to.be.calledOnce;
  });

  it('notifies field object about changed value', async function () {
    const valueChangedSpy = sinon.spy(this.field, 'valueChanged');
    await render(hbs `{{form-component/ace-field field=field}}`);

    await fillIn('textarea', 'abc');

    expect(valueChangedSpy).to.be.calledOnce;
    expect(valueChangedSpy).to.be.calledWith('abc');
  });

  it('sets input value to value specified in field object', async function () {
    this.set('field.value', 'abc');

    await render(hbs `{{form-component/ace-field field=field}}`);

    expect(find('textarea')).to.have.value('abc');
  });

  it('renders blocked editor when field is in "view" mode', async function () {
    this.field.changeMode('view');

    await render(hbs `{{form-component/ace-field field=field}}`);

    expect(find('textarea')).to.have.attr('disabled');
  });
});
