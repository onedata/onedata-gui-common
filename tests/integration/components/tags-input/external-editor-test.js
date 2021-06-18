import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | tags input/external editor', function () {
  setupComponentTest('tags-input/external-editor', {
    integration: true,
  });

  beforeEach(function () {
    this.setProperties({
      tags: [],
      tagsLimit: undefined,
      onChange: tags => this.set('tags', tags),
    });
  });

  it('has class "tags-input-external-editor"', function () {
    this.render(hbs `{{tags-input/external-editor}}`);

    expect(this.$().children()).to.have.class('tags-input-external-editor')
      .and.to.have.length(1);
  });

  it('does not render any content', async function () {
    await renderTagInput(this);
    await startCreation();

    const $editor = this.$('.tags-input-external-editor');
    expect($editor).to.exist;
    expect($editor.children()).to.have.length(0);
  });

  it('calls "settings.startTagCreationCallback" on component render',
    async function () {
      const startTagCreationCallbackSpy = sinon.spy();
      this.setProperties({
        tags: [{ label: '123' }, { label: '456' }],
        tagsLimit: 10,
        tagEditorSettings: {
          startTagCreationCallback: startTagCreationCallbackSpy,
        },
      });

      await renderTagInput(this);

      expect(startTagCreationCallbackSpy).to.not.be.called;
      await startCreation();

      expect(startTagCreationCallbackSpy).to.be.calledOnce.and.to.be.calledWith({
        onTagsAddedCallback: sinon.match.func,
        onEndTagCreationCallback: sinon.match.func,
        tagsLimit: 8,
      });
    });

  it('proxies tags addition via "onTagsAddedCallback"', async function () {
    let addTags;
    this.set('tagEditorSettings', {
      startTagCreationCallback: ({ onTagsAddedCallback }) => addTags = onTagsAddedCallback,
    });

    await renderTagInput(this);
    await startCreation();
    addTags([{ label: 'abc' }]);
    await wait();

    const $tagItems = this.$('.tag-item');
    expect($tagItems).to.have.length(1);
    expect($tagItems.text().trim()).to.equal('abc');
  });

  it('proxies creation end via "onEndTagCreationCallback"', async function () {
    let endCreation;
    this.set('tagEditorSettings', {
      startTagCreationCallback: ({ onEndTagCreationCallback }) => endCreation = onEndTagCreationCallback,
    });

    await renderTagInput(this);
    await startCreation();
    endCreation();
    await wait();

    expect(this.$('.tags-input-external-editor')).to.not.exist;
  });

  it('calls "settings.endTagCreationCallback" when editor is destroyed',
    async function () {
      const endTagCreationCallbackSpy = sinon.spy();
      this.set('tagEditorSettings', {
        endTagCreationCallback: endTagCreationCallbackSpy,
      });

      await renderTagInput(this);
      await startCreation();

      expect(endTagCreationCallbackSpy).to.not.be.called;
      this.set('tagsLimit', 0);
      await wait();

      expect(this.$('.tags-input-external-editor')).to.not.exist;
      expect(endTagCreationCallbackSpy).to.be.calledOnce;
    });
});

async function renderTagInput(testCase) {
  testCase.render(hbs `{{tags-input
    tags=tags
    tagsLimit=tagsLimit
    tagEditorComponentName="tags-input/external-editor"
    tagEditorSettings=tagEditorSettings
    onChange=onChange
  }}`);
}

async function startCreation() {
  await click('.tag-creator-trigger');
}
