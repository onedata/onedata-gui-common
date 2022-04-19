import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, triggerKeyEvent, blur, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

describe('Integration | Component | tags input/text editor', function () {
  setupRenderingTest();

  it('has class "tags-input-text-editor"', async function () {
    await render(hbs `{{tags-input/text-editor}}`);

    expect(find('.tags-input-text-editor')).to.exist;
  });

  it('renders empty text input with class "text-editor-input"', async function () {
    await render(hbs `{{tags-input/text-editor}}`);

    expect(find('input[type="text"]')).to.exist;
  });

  it('adds tag on enter', async function () {
    this.set('tags', []);
    this.set('change', (tags) => this.set('tags', tags));

    await render(hbs `{{tags-input
      tags=tags
      tagEditorComponentName="tags-input/text-editor"
      onChange=(action change)
    }}`);

    return click('.tag-creator-trigger')
      .then(() => fillIn('.text-editor-input', 'someTag'))
      .then(() => triggerKeyEvent('.text-editor-input', 'keydown', 'Enter'))
      .then(() => {
        expect(find('.text-editor-input').value).to.be.empty;
        const tagItems = findAll('.tag-item');
        expect(tagItems).to.have.length(1);
        expect(tagItems[0].textContent.trim()).to.equal('someTag');
      });
  });

  it('separates new tags using comma', async function () {
    this.set('tags', []);
    const changeSpy = sinon.spy((tags) => this.set('tags', tags));
    this.set('change', changeSpy);

    await render(hbs `{{tags-input
      tags=tags
      tagEditorComponentName="tags-input/text-editor"
      onChange=(action change)
    }}`);

    return click('.tag-creator-trigger')
      .then(() => fillIn('.text-editor-input', 'someTag,'))
      .then(() => {
        expect(find('.text-editor-input').value).to.be.empty;
        expect(changeSpy.lastCall.args[0]).to.deep.equal([{
          label: 'someTag',
        }]);
      });
  });

  it('separates multiple new tags using comma', async function () {
    this.set('tags', []);
    const changeSpy = sinon.spy((tags) => this.set('tags', tags));
    this.set('change', changeSpy);

    await render(hbs `{{tags-input
      tags=tags
      tagEditorComponentName="tags-input/text-editor"
      onChange=(action change)
    }}`);

    return click('.tag-creator-trigger')
      .then(() => fillIn('.text-editor-input', 'someTag,someTag2,someTag3'))
      .then(() => {
        expect(find('.text-editor-input').value).to.equal('someTag3');
        expect(changeSpy.lastCall.args[0]).to.deep.equal([{
          label: 'someTag',
        }, {
          label: 'someTag2',
        }]);
      });
  });

  it('separates new tags using custom separators', async function () {
    this.set('tags', []);
    const changeSpy = sinon.spy((tags) => this.set('tags', tags));
    this.set('change', changeSpy);

    await render(hbs `{{tags-input
      tags=tags
      tagEditorComponentName="tags-input/text-editor"
      tagEditorSettings=(hash separators=(array ";" "/"))
      onChange=(action change)
    }}`);

    return click('.tag-creator-trigger')
      .then(() => fillIn(
        '.text-editor-input',
        'someTag;someTag2/someTag3,someTag4'
      ))
      .then(() => {
        expect(find('.text-editor-input').value).to.equal('someTag3,someTag4');
        expect(changeSpy.lastCall.args[0]).to.deep.equal([{
          label: 'someTag',
        }, {
          label: 'someTag2',
        }]);
      });
  });

  it('turns off edition after loosing focus with empty input', async function () {
    await render(hbs `{{tags-input
      tagEditorComponentName="tags-input/text-editor"
    }}`);

    return click('.tag-creator-trigger')
      .then(() => blur('.text-editor-input'))
      .then(() => expect(find('.text-editor-input')).to.not.exist);
  });

  it(
    'does not turn off edition after loosing focus with filled input',
    async function () {
      await render(hbs `{{tags-input
        tagEditorComponentName="tags-input/text-editor"
      }}`);

      return click('.tag-creator-trigger')
        .then(() => fillIn('.text-editor-input', 'abc'))
        .then(() => blur('.text-editor-input'))
        .then(() => expect(find('.text-editor-input')).to.exist);
    }
  );

  it('trims tags', async function () {
    this.set('tags', []);
    const changeSpy = sinon.spy((tags) => this.set('tags', tags));
    this.set('change', changeSpy);

    await render(hbs `{{tags-input
      tags=tags
      tagEditorComponentName="tags-input/text-editor"
      onChange=(action change)
    }}`);

    return click('.tag-creator-trigger')
      .then(() => fillIn(
        '.text-editor-input',
        '    someTag ,  someTag2, , someTag3   '
      ))
      .then(() => {
        expect(find('.text-editor-input').value).to.equal(' someTag3   ');
        expect(changeSpy.lastCall.args[0]).to.deep.equal([{
          label: 'someTag',
        }, {
          label: 'someTag2',
        }]);
      });
  });

  it('does not add tag which not match settings.regexp', async function () {
    this.setProperties({
      tags: [],
      settings: {
        regexp: /^\d+$/,
      },
    });
    const changeSpy = sinon.spy((tags) => this.set('tags', tags));
    this.set('change', changeSpy);

    await render(hbs `{{tags-input
      tags=tags
      tagEditorComponentName="tags-input/text-editor"
      tagEditorSettings=settings
      onChange=(action change)
    }}`);
    return click('.tag-creator-trigger')
      .then(() => fillIn('.text-editor-input', '1a'))
      .then(() => triggerKeyEvent('.text-editor-input', 'keydown', 'Enter'))
      .then(() => {
        expect(find('.text-editor-input').value).to.equal('1a');
        expect(find('.tags-input-text-editor')).to.have.class('has-error');
        expect(changeSpy).to.not.been.called;
      });
  });

  it('does not add multiple tags which not match settings.regexp', async function () {
    this.setProperties({
      tags: [],
      settings: {
        regexp: /^\d+$/,
      },
    });
    const changeSpy = sinon.spy((tags) => this.set('tags', tags));
    this.set('change', changeSpy);

    await render(hbs `{{tags-input
      tags=tags
      tagEditorComponentName="tags-input/text-editor"
      tagEditorSettings=settings
      onChange=(action change)
    }}`);
    return click('.tag-creator-trigger')
      .then(() => fillIn('.text-editor-input', '234,1a,cvs,sd,2'))
      .then(() => {
        expect(find('.text-editor-input').value).to.equal('1a,cvs,sd,2');
        expect(find('.tags-input-text-editor')).to.have.class('has-error');
        expect(changeSpy.lastCall.args[0]).to.deep.equal([{
          label: '234',
        }]);
      });
  });

  it('removes error indication after modifying input value', async function () {
    this.setProperties({
      tags: [],
      settings: {
        regexp: /^\d+$/,
      },
    });

    await render(hbs `{{tags-input
      tags=tags
      tagEditorComponentName="tags-input/text-editor"
      tagEditorSettings=settings
    }}`);
    return click('.tag-creator-trigger')
      .then(() => fillIn('.text-editor-input', '1a'))
      .then(() => triggerKeyEvent('.text-editor-input', 'keydown', 'Enter'))
      .then(() => fillIn('.text-editor-input', '1ab'))
      .then(() =>
        expect(find('.tags-input-text-editor')).to.not.have.class('has-error')
      );
  });

  it(
    'transforms each new tag label using settings.transform, if it was provided',
    async function () {
      this.setProperties({
        tags: [],
        settings: {
          transform: label => label.toUpperCase(),
        },
      });
      const changeSpy = sinon.spy((tags) => this.set('tags', tags));
      this.set('change', changeSpy);

      await render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="tags-input/text-editor"
        tagEditorSettings=settings
        onChange=(action change)
      }}`);
      return click('.tag-creator-trigger')
        .then(() => fillIn('.text-editor-input', 'pl,'))
        .then(() => expect(changeSpy.lastCall.args[0]).to.deep.equal([{ label: 'PL' }]));
    }
  );

  it(
    'uses placeholder taken form settings.placeholder',
    async function () {
      this.set('settings', {
        placeholder: 'sometext',
      });

      await render(hbs `{{tags-input
        tagEditorComponentName="tags-input/text-editor"
        tagEditorSettings=settings
      }}`);

      return click('.tag-creator-trigger')
        .then(() =>
          expect(find('.text-editor-input').placeholder).to.equal('sometext')
        );
    }
  );
});
