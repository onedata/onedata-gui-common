// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable max-len */

import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

describe('Integration | Component | tags input/external editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      tags: [],
      tagsLimit: undefined,
      onChange: tags => this.set('tags', tags),
    });
  });

  it('has class "tags-input-external-editor"', async function () {
    await render(hbs `{{tags-input/external-editor}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('tags-input-external-editor');
  });

  it('does not render any content', async function () {
    await renderTagInput();
    await startCreation();

    const editor = find('.tags-input-external-editor');
    expect(editor).to.exist;
    expect(editor.children).to.have.length(0);
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

      await renderTagInput();

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

    await renderTagInput();
    await startCreation();
    addTags([{ label: 'abc' }]);
    await settled();

    const tagItems = findAll('.tag-item');
    expect(tagItems).to.have.length(1);
    expect(tagItems[0].textContent.trim()).to.equal('abc');
  });

  it('proxies creation end via "onEndTagCreationCallback"', async function () {
    let endCreation;
    this.set('tagEditorSettings', {
      startTagCreationCallback: ({ onEndTagCreationCallback }) => endCreation = onEndTagCreationCallback,
    });

    await renderTagInput();
    await startCreation();
    endCreation();
    await settled();

    expect(find('.tags-input-external-editor')).to.not.exist;
  });

  it('calls "settings.endTagCreationCallback" when editor is destroyed',
    async function () {
      const endTagCreationCallbackSpy = sinon.spy();
      this.set('tagEditorSettings', {
        endTagCreationCallback: endTagCreationCallbackSpy,
      });

      await renderTagInput();
      await startCreation();

      expect(endTagCreationCallbackSpy).to.not.be.called;
      this.set('tagsLimit', 0);
      await settled();

      expect(find('.tags-input-external-editor')).to.not.exist;
      expect(endTagCreationCallbackSpy).to.be.calledOnce;
    });
});

async function renderTagInput() {
  await render(hbs `{{tags-input
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
