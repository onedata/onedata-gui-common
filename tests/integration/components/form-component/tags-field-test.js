import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import TagsField from 'onedata-gui-common/utils/form-component/tags-field';
import { click, focus, blur, fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { setProperties, get } from '@ember/object';

describe('Integration | Component | form component/tags field', function () {
  setupComponentTest('form-component/tags-field', {
    integration: true
  });

  beforeEach(function () {
    this.set('field', TagsField.create());
  });

  it(
    'has class "tags-field"',
    function () {
      this.render(hbs `{{form-component/tags-field field=field}}`);

      expect(this.$('.tags-field')).to.exist;
    }
  );

  it(
    'renders tags-input component',
    function () {
      this.render(hbs `{{form-component/tags-field field=field}}`);

      expect(this.$('.tags-input')).to.exist;
    }
  );

  it(
    'notifies field object about lost focus',
    function () {
      const focusLostSpy = sinon.spy(this.get('field'), 'focusLost');

      this.render(hbs `{{form-component/tags-field field=field}}`);

      return focus('.tags-input')
        .then(() => blur('.tags-input'))
        .then(() => expect(focusLostSpy).to.be.calledOnce);
    }
  );

  it(
    'notifies field object about changed value',
    function () {
      const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');

      this.render(hbs `{{form-component/tags-field field=field}}`);

      return click('.tag-creator-trigger')
        .then(() => fillIn('.text-editor-input', 'test,aest,'))
        .then(() => {
          expect(valueChangedSpy).to.be.calledOnce;
          expect(valueChangedSpy).to.be.calledWith(['test', 'aest']);
        });
    }
  );

  it('sets input value to tags specified in field object', function () {
    this.set('field.value', ['test', 'test2']);

    this.render(hbs `{{form-component/tags-field field=field}}`);

    const $tags = this.$('.tag-item');
    expect($tags).to.have.length(2);
    expect($tags.eq(0).text().trim()).to.equal('test');
    expect($tags.eq(1).text().trim()).to.equal('test2');
  });

  it('sets input id according to "fieldId"', function () {
    this.render(hbs `
      {{form-component/tags-field field=field fieldId="abc"}}
    `);

    expect(this.$('.tags-input#abc')).to.exist;
  });

  it('allows to specify custom tags editor with custom settings', function () {
    const settings = Object.freeze({ a: 1 });
    setProperties(this.get('field'), {
      tagEditorComponentName: 'test-component',
      tagEditorSettings: settings,
    });

    this.render(hbs `{{form-component/tags-field field=field}}`);

    return click('.tag-creator-trigger')
      .then(() => {
        const testEditor = this.$('.tag-creator .test-component');
        expect(testEditor).to.exist;
        expect(get(testEditor[0].componentInstance, 'settings'))
          .to.equal(settings);
      })
  });

  it('turns on tags sorting according to truthy "sort" property', function () {
    this.set('field.sort', true);
    const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');

    this.render(hbs `{{form-component/tags-field field=field}}`);

    return click('.tag-creator-trigger')
      .then(() => fillIn('.text-editor-input', 'test,aest,'))
      .then(() => {
        expect(valueChangedSpy).to.be.calledOnce;
        expect(valueChangedSpy).to.be.calledWith(['aest', 'test']);
      });
  });
});
