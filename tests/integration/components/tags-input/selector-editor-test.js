import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';

describe('Integration | Component | tags input/selector editor', function () {
  setupComponentTest('tags-input/selector-editor', {
    integration: true,
  });

  beforeEach(function () {
    this.set('settings', {
      allowedTags: [{
        label: 'a',
        icon: 'space',
      }, {
        label: 'b',
      }],
    });
  });

  it('has class "tags-input-selector-editor"', function () {
    this.render(hbs `{{tags-input/selector-editor}}`);

    expect(this.$('.tags-input-selector-editor')).to.exist;
  });

  it('renders popover', function () {
    this.render(hbs `{{tags-input/selector-editor}}`);

    expect(getSelector()).to.exist;
  });

  it('renders passed available tags', function () {
    this.render(hbs `{{tags-input
      tagEditorComponentName="tags-input/selector-editor"
      tagEditorSettings=settings
    }}`);

    return click('.tag-creator-trigger')
      .then(() => {
        const $options = getSelector().find('.selector-item');
        expect($options).to.have.length(2);
        expect($options.eq(0).text().trim()).to.equal('a');
        expect($options.eq(1).text().trim()).to.equal('b');
        expect($options.eq(0).find('.tag-icon')).to.have.class('oneicon-space');
        expect($options.eq(1).find('.tag-icon')).to.not.exist;
      });
  });

  it('does not render tags, which are already selected', function () {
    // Intentionally it does not point to objects in settings.availableTags to check
    // if it will deal with the same tags, but under different object references.
    this.set('selectedTags', [{ label: 'b' }]);

    this.render(hbs `{{tags-input
      tags=selectedTags
      tagEditorComponentName="tags-input/selector-editor"
      tagEditorSettings=settings
    }}`);

    return click('.tag-creator-trigger')
      .then(() => {
        const $options = getSelector().find('.selector-item');
        expect($options).to.have.length(1);
        expect($options.text().trim()).to.equal('a');
      });
  });

  it('allows to add tag by clicking on it', function () {
    this.set('tags', []);
    const changeSpy = sinon.spy(tags => this.set('tags', tags));
    this.on('change', changeSpy);

    this.render(hbs `{{tags-input
      tags=tags
      tagEditorComponentName="tags-input/selector-editor"
      tagEditorSettings=settings
      onChange=(action "change")
    }}`);

    return click('.tag-creator-trigger')
      .then(() => click(getSelector().find('.selector-item')[0]))
      .then(() => {
        const $options = getSelector().find('.selector-item');
        expect($options).to.have.length(1);
        expect($options.text().trim()).to.equal('b');
        expect(changeSpy.lastCall.args[0].toArray())
          .to.deep.equal([this.get('settings.allowedTags')[0]]);
      });
  });

  it('ends creation mode after adding last possible tag', function () {
    this.set('tags', [Object.assign({}, this.get('settings.allowedTags')[0])]);
    const changeSpy = sinon.spy(tags => this.set('tags', tags));
    this.on('change', changeSpy);

    this.render(hbs `{{tags-input
      tags=tags
      tagEditorComponentName="tags-input/selector-editor"
      tagEditorSettings=settings
      onChange=(action "change")
    }}`);

    return click('.tag-creator-trigger')
      .then(() => click(getSelector().find('.selector-item')[0]))
      .then(() => {
        expect(getSelector()).to.not.exist;
        expect(changeSpy.lastCall.args[0].toArray())
          .to.deep.equal(this.get('settings.allowedTags').toArray());
      });
  });

  it('closes selector on click on non-parent tags-input', function () {
    this.render(hbs `
      {{tags-input
        tagEditorSettings=settings
        tagEditorComponentName="tags-input/selector-editor"
      }}
      {{tags-input tagEditorComponentName="test-component"}}
    `);

    return click('.tags-input:first-child .tag-creator-trigger')
      .then(() => click('.tags-input:last-child'))
      .then(() => expect(getSelector()).to.not.exist);
  });

  it('does not close selector on click on parent tags-input', function () {
    this.render(hbs `
      {{tags-input
        tagEditorSettings=settings
        tagEditorComponentName="tags-input/selector-editor"
      }}
      {{tags-input tagEditorComponentName="test-component"}}
    `);

    return click('.tags-input:first-child .tag-creator-trigger')
      .then(() => click('.tags-input:first-child'))
      .then(() => expect(getSelector()).to.exist);
  });
});

function getSelector() {
  return $('.webui-popover.in .tags-selector');
}
