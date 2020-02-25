import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { click, fillIn, keyEvent, blur } from 'ember-native-dom-helpers';
import sinon from 'sinon';

describe('Integration | Component | tags input/text editor', function () {
  setupComponentTest('tags-input/text-editor', {
    integration: true
  });

  it('has class "tags-input-text-editor"', function () {
    this.render(hbs `{{tags-input/text-editor}}`);

    expect(this.$('.tags-input-text-editor')).to.exist;
  });

  it('renders empty text input with class "text-editor-input"', function () {
    this.render(hbs `{{tags-input/text-editor}}`);

    expect(this.$('input[type="text"]')).to.exist;
  });

  it('adds tag on enter', function () {
    this.set('tags', []);
    this.on('change', (tags) => this.set('tags', tags));

    this.render(hbs `{{tags-input
      tags=tags
      tagEditorComponentName="tags-input/text-editor"
      onChange=(action "change")
    }}`);

    return click('.tag-creator-trigger')
      .then(() => fillIn('.text-editor-input', 'someTag'))
      .then(() => keyEvent('.text-editor-input', 'keydown', 13))
      .then(() => {
        expect(this.$('.text-editor-input').val()).to.be.empty;
        const $tagItems = this.$('.tag-item');
        expect($tagItems).to.have.length(1);
        expect($tagItems.text().trim()).to.equal('someTag');
      });
  });

  it('separates new tags using comma', function () {
    this.set('tags', []);
    const changeSpy = sinon.spy((tags) => this.set('tags', tags));
    this.on('change', changeSpy);

    this.render(hbs `{{tags-input
      tags=tags
      tagEditorComponentName="tags-input/text-editor"
      onChange=(action "change")
    }}`);

    return click('.tag-creator-trigger')
      .then(() => fillIn('.text-editor-input', 'someTag,'))
      .then(() => {
        expect(this.$('.text-editor-input').val()).to.be.empty;
        expect(changeSpy.lastCall).to.be.calledWith([{
          label: 'someTag',
        }]);
      })
  });

  it('separates multiple new tags using comma', function () {
    this.set('tags', []);
    const changeSpy = sinon.spy((tags) => this.set('tags', tags));
    this.on('change', changeSpy);

    this.render(hbs `{{tags-input
      tags=tags
      tagEditorComponentName="tags-input/text-editor"
      onChange=(action "change")
    }}`);

    return click('.tag-creator-trigger')
      .then(() => fillIn('.text-editor-input', 'someTag,someTag2,someTag3'))
      .then(() => {
        expect(this.$('.text-editor-input').val()).to.equal('someTag3');
        expect(changeSpy.lastCall).to.be.calledWith([{
          label: 'someTag',
        }, {
          label: 'someTag2',
        }]);
      })
  });

  it('separates new tags using custom separators', function () {
    this.set('tags', []);
    const changeSpy = sinon.spy((tags) => this.set('tags', tags));
    this.on('change', changeSpy);

    this.render(hbs `{{tags-input
      tags=tags
      tagEditorComponentName="tags-input/text-editor"
      tagEditorSettings=(hash separators=(array ";" "/"))
      onChange=(action "change")
    }}`);

    return click('.tag-creator-trigger')
      .then(() => fillIn(
        '.text-editor-input',
        'someTag;someTag2/someTag3,someTag4'
      ))
      .then(() => {
        expect(this.$('.text-editor-input').val()).to.equal('someTag3,someTag4');
        expect(changeSpy.lastCall).to.be.calledWith([{
          label: 'someTag',
        }, {
          label: 'someTag2',
        }]);
      })
  });

  it('turns off edition after loosing focus with empty input', function () {
    this.render(hbs `{{tags-input
      tagEditorComponentName="tags-input/text-editor"
    }}`);

    return click('.tag-creator-trigger')
      .then(() => blur('.text-editor-input'))
      .then(() => expect(this.$('.text-editor-input')).to.not.exist);
  });

  it(
    'does not turn off edition after loosing focus with filled input',
    function () {
      this.render(hbs `{{tags-input
        tagEditorComponentName="tags-input/text-editor"
      }}`);

      return click('.tag-creator-trigger')
        .then(() => fillIn('.text-editor-input', 'abc'))
        .then(() => blur('.text-editor-input'))
        .then(() => expect(this.$('.text-editor-input')).to.exist);
    }
  );

  it('trims tags', function () {
    this.set('tags', []);
    const changeSpy = sinon.spy((tags) => this.set('tags', tags));
    this.on('change', changeSpy);

    this.render(hbs `{{tags-input
      tags=tags
      tagEditorComponentName="tags-input/text-editor"
      onChange=(action "change")
    }}`);

    return click('.tag-creator-trigger')
      .then(() => fillIn(
        '.text-editor-input',
        '    someTag ,  someTag2, , someTag3   '
      ))
      .then(() => {
        expect(this.$('.text-editor-input').val()).to.equal(' someTag3   ');
        expect(changeSpy.lastCall).to.be.calledWith([{
          label: 'someTag',
        }, {
          label: 'someTag2',
        }]);
      })
  });

  it('does not add tag which not match settings.regexp', function () {
    this.setProperties({
      tags: [],
      settings: {
        regexp: /^\d+$/
      },
    });
    const changeSpy = sinon.spy((tags) => this.set('tags', tags));
    this.on('change', changeSpy);

    this.render(hbs `{{tags-input
      tags=tags
      tagEditorComponentName="tags-input/text-editor"
      tagEditorSettings=settings
      onChange=(action "change")
    }}`);
    return click('.tag-creator-trigger')
      .then(() => fillIn('.text-editor-input', '1a'))
      .then(() => keyEvent('.text-editor-input', 'keydown', 13))
      .then(() => {
        expect(this.$('.text-editor-input').val()).to.equal('1a,');
        expect(changeSpy).to.not.been.called;
      });
  });

  it('does not add multiple tags which not match settings.regexp', function () {
    this.setProperties({
      tags: [],
      settings: {
        regexp: /^\d+$/
      },
    });
    const changeSpy = sinon.spy((tags) => this.set('tags', tags));
    this.on('change', changeSpy);

    this.render(hbs `{{tags-input
      tags=tags
      tagEditorComponentName="tags-input/text-editor"
      tagEditorSettings=settings
      onChange=(action "change")
    }}`);
    return click('.tag-creator-trigger')
      .then(() => fillIn('.text-editor-input', '234,1a,cvs,sd,2'))
      .then(() => {
        expect(this.$('.text-editor-input').val()).to.equal('1a,cvs,sd,2');
        expect(changeSpy.lastCall).to.be.calledWith([{
          label: '234',
        }]);
      });
  });
});
