import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, focus, blur, fillIn, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import TagsField from 'onedata-gui-common/utils/form-component/tags-field';
import sinon from 'sinon';
import { setProperties, get } from '@ember/object';
import $ from 'jquery';

describe('Integration | Component | form component/tags field', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('field', TagsField.create());
  });

  it(
    'has class "tags-field"',
    async function () {
      await render(hbs `{{form-component/tags-field field=field}}`);

      expect(find('.tags-field')).to.exist;
    }
  );

  it(
    'renders tags-input component',
    async function () {
      await render(hbs `{{form-component/tags-field field=field}}`);

      expect(find('.tags-input')).to.exist;
    }
  );

  it(
    'can be disabled',
    async function () {
      this.set('field.isEnabled', false);

      await render(hbs `{{form-component/tags-field field=field}}`);

      expect(find('.tags-input').getAttribute('disabled')).to.be.not.null;
    }
  );

  it(
    'notifies field object about lost focus',
    async function () {
      const focusLostSpy = sinon.spy(this.get('field'), 'focusLost');

      await render(hbs `{{form-component/tags-field field=field}}`);

      return focus('.tags-input')
        .then(() => blur('.tags-input'))
        .then(() => expect(focusLostSpy).to.be.calledOnce);
    }
  );

  it(
    'notifies field object about changed value',
    async function () {
      const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');

      await render(hbs `{{form-component/tags-field field=field}}`);

      return click('.tag-creator-trigger')
        .then(() => fillIn('.text-editor-input', 'test,aest,'))
        .then(() => {
          expect(valueChangedSpy).to.be.calledOnce;
          expect(valueChangedSpy).to.be.calledWith(['test', 'aest']);
        });
    }
  );

  it('sets input value to tags specified in field object', async function () {
    this.set('field.value', ['test', 'test2']);

    await render(hbs `{{form-component/tags-field field=field}}`);

    const tags = findAll('.tag-item');
    expect(tags).to.have.length(2);
    expect(tags[0].textContent.trim()).to.equal('test');
    expect(tags[1].textContent.trim()).to.equal('test2');
  });

  it('sets input id according to "fieldId"', async function () {
    await render(hbs `
      {{form-component/tags-field field=field fieldId="abc"}}
    `);

    expect(find('.tags-input#abc')).to.exist;
  });

  it('allows to specify custom tags editor with custom settings', async function () {
    const settings = Object.freeze({ a: 1 });
    setProperties(this.get('field'), {
      tagEditorComponentName: 'test-component',
      tagEditorSettings: settings,
    });

    await render(hbs `{{form-component/tags-field field=field}}`);

    return click('.tag-creator-trigger')
      .then(() => {
        const testEditor = find('.tag-creator .test-component');
        expect(testEditor).to.exist;
        expect(get(testEditor.componentInstance, 'settings'))
          .to.equal(settings);
      });
  });

  it('turns on tags sorting according to truthy "sort" property', async function () {
    this.set('field.sort', true);
    const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');

    await render(hbs `{{form-component/tags-field field=field}}`);

    return click('.tag-creator-trigger')
      .then(() => fillIn('.text-editor-input', 'test,aest,'))
      .then(() => {
        expect(valueChangedSpy).to.be.calledOnce;
        expect(valueChangedSpy).to.be.calledWith(['aest', 'test']);
      });
  });

  it('renders readonly tags input when field is in "view" mode', async function () {
    this.get('field').changeMode('view');

    await render(hbs `{{form-component/tags-field field=field}}`);

    expect($(find('.tags-input'))).to.have.class('readonly');
  });

  it('limits tags number via "tagsLimit"', async function () {
    this.set('field.value', ['test', 'test2']);
    this.set('field.tagsLimit', 1);

    await render(hbs `{{form-component/tags-field field=field}}`);

    expect($(find('.tag-creator-trigger'))).to.have.class('disabled');
  });

  it('does not show clear button, when "isClearButtonVisible" is false', async function () {
    this.set('field.value', ['test']);
    this.set('field.isClearButtonVisible', false);

    await render(hbs `{{form-component/tags-field field=field}}`);

    expect(find('.input-clear-trigger')).to.not.exist;
  });

  it('shows clear button, when "isClearButtonVisible" is true', async function () {
    this.set('field.value', ['test']);
    this.set('field.isClearButtonVisible', true);

    await render(hbs `{{form-component/tags-field field=field}}`);

    expect(find('.input-clear-trigger')).to.exist;
  });
});
