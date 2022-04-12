import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click, focus, blur, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { get, set } from '@ember/object';
import OneTooltipHelper from '../../helpers/one-tooltip';
import $ from 'jquery';

const disabledCreateTriggerTip = 'Maximum number of elements has been reached.';

describe('Integration | Component | tags input', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('tags', [{
      label: 'a',
    }, {
      label: 'b',
    }]);
  });

  it('has class "tags-input"', async function () {
    await render(hbs `{{tags-input}}`);

    expect(find('.tags-input')).to.exist;
  });

  it('shows passed tags', async function () {
    await render(hbs `{{tags-input tags=tags}}`);

    const tags = findAll('.tag-item');
    expect(tags).to.have.length(2);
    expect(tags[0].textContent.trim()).to.equal('a');
    expect(tags[1].textContent.trim()).to.equal('b');
  });

  it('shows tags icons', async function () {
    this.set('tags.firstObject.icon', 'space');

    await render(hbs `{{tags-input tags=tags}}`);

    expect($(find('.tag-item:nth-child(1) .tag-icon')))
      .to.have.class('oneicon-space');
    expect(find('.tag-item:nth-child(2) .tag-icon')).to.not.exist;
  });

  it('removes tags via remove icon on each tag', async function () {
    const oldTags = this.get('tags').slice(0);
    const changeSpy = sinon.spy(tags => this.set('tags', tags));
    this.set('change', changeSpy);

    await render(hbs `{{tags-input tags=tags onChange=(action change)}}`);

    await click('.tag-item:first-child .tag-remove');

    const tagItems = findAll('.tag-item');
    expect(tagItems).to.have.length(1);
    expect(tagItems[0].textContent.trim()).to.equal(oldTags[1].label);
    expect(changeSpy).to.be.calledOnce;
    expect(changeSpy.lastCall.args[0].toArray())
      .to.deep.equal(oldTags.slice(1).toArray());
  });

  it(
    'does not perform tag removing if "onChange" property is not specified',
    async function () {
      await render(hbs `{{tags-input tags=tags}}`);

      await click('.tag-item:first-child .tag-remove');

      expect(findAll('.tag-item')).to.have.length(2);
    }
  );

  it(
    'notifies about lost focus through onFocusLost',
    async function () {
      const focusLostSpy = sinon.spy();
      this.set('focusLost', focusLostSpy);

      await render(hbs `
        {{tags-input tags=tags onFocusLost=(action focusLost)}}
      `);

      await focus('.tags-input');
      expect(focusLostSpy).to.be.not.called;

      await blur('.tags-input');
      expect(focusLostSpy).to.be.calledOnce;
    }
  );

  it(
    'goes into creating new tag mode on tag-creator-trigger click',
    async function () {
      await render(hbs `{{tags-input tags=tags}}`);

      expect(find('.tag-creator')).to.not.exist;

      await click('.tag-creator-trigger');
      expect($(find('.tags-input'))).to.have.class('creating-tag');
      expect(find('.tag-creator')).to.exist;
    }
  );

  it(
    'goes into creating new tag mode on click',
    async function () {
      await render(hbs `{{tags-input tags=tags}}`);

      await click('.tags-input');

      expect($(find('.tags-input'))).to.have.class('creating-tag');
      expect(find('.tag-creator')).to.exist;
    }
  );

  it(
    'uses "tagEditorComponentName" property to render tag creation editor component',
    async function () {
      await render(hbs `
        {{tags-input tags=tags tagEditorComponentName="test-component"}}
      `);

      await click('.tag-creator-trigger');

      expect(find('.tag-creator .test-component')).to.exist;
    }
  );

  it(
    'uses tags-input/text-editor as a default tag creation editor component',
    async function () {
      await render(hbs `{{tags-input tags=tags}}`);

      await click('.tag-creator-trigger');
      expect(find('.tag-creator .tags-input-text-editor')).to.exist;
    }
  );

  it(
    'allows to end creating tag operation from within tag creation editor',
    async function () {
      await render(hbs `
        {{tags-input tags=tags tagEditorComponentName="test-component"}}
      `);

      await click('.tag-creator-trigger');
      const testComponent = find('.tag-creator .test-component').componentInstance;
      get(testComponent, 'onEndTagCreation')();
      await settled();

      expect($(find('.tags-input'))).to.not.have.class('creating-tag');
      expect(find('.tag-creator')).to.not.exist;
    }
  );

  it(
    'allows to add tags through "onTagsAdded" action passed to tag creation editor',
    async function () {
      const newTags = [{
        label: 'c',
      }, {
        label: 'd',
      }];
      const changeSpy = sinon.spy();
      this.set('change', changeSpy);
      await render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="test-component"
        onChange=(action change)
      }}`);

      await click('.tag-creator-trigger');
      const testComponent = find('.tag-creator .test-component').componentInstance;
      get(testComponent, 'onTagsAdded')(newTags);
      await settled();

      expect(changeSpy).to.be.calledWith(sinon.match.has('length', 4));
    }
  );

  it(
    'injects currently selected tags into creation editor',
    async function () {
      await render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      await click('.tag-creator-trigger');

      const testComponent = find('.tag-creator .test-component').componentInstance;
      expect(get(testComponent, 'selectedTags')).to.equal(this.get('tags'));
    }
  );

  it('injects tags limit into creation editor', async function () {
    await render(hbs `{{tags-input
      tags=tags
      tagsLimit=10
      tagEditorComponentName="test-component"
    }}`);

    await click('.tag-creator-trigger');

    const testComponent = find('.tag-creator .test-component').componentInstance;
    expect(get(testComponent, 'tagsLimit')).to.equal(10 - this.get('tags.length'));
  });

  it('injects undefined tags limit into creation editor when tags limit is not defined',
    async function () {
      await render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      await click('.tag-creator-trigger');

      const testComponent = find('.tag-creator .test-component').componentInstance;
      expect(get(testComponent, 'tagsLimit')).to.be.undefined;
    });

  it(
    'passess tagEditorSettings to the tag creation editor',
    async function () {
      const settings = Object.freeze({
        a: 1,
      });
      this.set('settings', settings);

      await render(hbs `{{tags-input
        tagEditorComponentName="test-component"
        tagEditorSettings=settings
      }}`);

      await click('.tag-creator-trigger');

      const testComponent = find('.tag-creator .test-component').componentInstance;
      expect(get(testComponent, 'settings')).to.deep.equal(settings);
    }
  );

  it(
    'focuses editor after tag-creator-trigger click in creation mode',
    async function () {
      const focusSpy = sinon.spy();

      await render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      await click('.tag-creator-trigger');
      const testComponent = find('.tag-creator .test-component').componentInstance;
      set(testComponent, 'focusIn', focusSpy);

      await click('.tag-creator-trigger');
      expect(focusSpy).to.be.calledOnce;
    }
  );

  it(
    'does not allow to add and remove tags when disabled',
    async function () {
      await render(hbs `{{tags-input
        disabled=true
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      const $tagsInput = $(find('.tags-input'));
      expect($tagsInput).to.have.attr('disabled');
      expect(find('.tag-creator-trigger')).to.not.exist;
      expect(find('.tag-remove')).to.not.exist;

      await click('.tags-input');
      expect($tagsInput).to.not.have.class('creating-tag');
      expect(find('.tag-creator')).to.not.exist;
    }
  );

  it(
    'stops tag creation when becomes disabled',
    async function () {
      this.set('disabled', false);

      await render(hbs `{{tags-input
        disabled=disabled
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      await click('.tags-input');
      this.set('disabled', true);
      await settled();

      expect($(find('.tags-input'))).to.not.have.class('creating-tag');
      expect(find('.tag-creator')).to.not.exist;
    }
  );

  it(
    'does not allow to add and remove tags in readonly mode',
    async function () {
      await render(hbs `{{tags-input
        readonly=true
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      const $tagsInput = $(find('.tags-input'));
      expect($tagsInput).to.have.class('readonly');
      expect(find('.tag-creator-trigger')).to.not.exist;
      expect(find('.tag-remove')).to.not.exist;

      await click('.tags-input');
      expect($tagsInput).to.not.have.class('creating-tag');
      expect(find('.tag-creator')).to.not.exist;
    }
  );

  it(
    'stops tag creation when becomes readonly',
    async function () {
      this.set('readonly', false);

      await render(hbs `{{tags-input
        readonly=readonly
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      await click('.tags-input');
      this.set('readonly', true);
      await settled();

      expect($(find('.tags-input'))).to.not.have.class('creating-tag');
      expect(find('.tag-creator')).to.not.exist;
    }
  );

  it('disables tag creation when number of already provided tags is equal to the limit',
    async function () {
      await render(hbs `{{tags-input
        tags=tags
        tagsLimit=tags.length
        tagEditorComponentName="test-component"
      }}`);

      const $createTrigger = $(find('.tag-creator-trigger'));
      expect($createTrigger).to.have.class('disabled');
      await click($createTrigger[0]);

      expect(find('.tag-creator')).to.not.exist;
      expect(await getCreateTriggerTip()).to.equal(disabledCreateTriggerTip);
    });

  it('disables tag creation when number of already provided tags is greater that the limit',
    async function () {
      await render(hbs `{{tags-input
        tags=tags
        tagsLimit=0
        tagEditorComponentName="test-component"
      }}`);

      const $createTrigger = $(find('.tag-creator-trigger'));
      expect($createTrigger).to.have.class('disabled');
      await click($createTrigger[0]);

      expect(find('.tag-creator')).to.not.exist;
      expect(await getCreateTriggerTip()).to.equal(disabledCreateTriggerTip);
    });

  it('does not disable tag creation when number of already provided tags is lower that the limit',
    async function () {
      this.set('tagsLimit', this.get('tags.length') + 1);
      await render(hbs `{{tags-input
        tags=tags
        tagsLimit=9999
        tagEditorComponentName="test-component"
      }}`);

      const $createTrigger = $(find('.tag-creator-trigger'));
      expect($createTrigger).to.not.have.class('disabled');
      await click($createTrigger[0]);

      expect(find('.tag-creator')).to.exist;
      expect(await getCreateTriggerTip()).to.be.undefined;
    });

  it('stops tag creation when tags limit changes and tags number exceeds it',
    async function () {
      this.set('tagsLimit', 10);

      await render(hbs `{{tags-input
        tagsLimit=tagsLimit
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      await click('.tag-creator-trigger');
      this.set('tagsLimit', 1);
      await settled();

      expect($(find('.tags-input'))).to.not.have.class('creating-tag');
      expect(find('.tag-creator')).to.not.exist;
    });

  it('does not stop tag creation when tags limit changes and tags number is within it',
    async function () {
      this.set('tagsLimit', 10);

      await render(hbs `{{tags-input
        tagsLimit=tagsLimit
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      await click('.tag-creator-trigger');
      this.set('tagsLimit', 8);
      await settled();

      expect($(find('.tags-input'))).to.have.class('creating-tag');
      expect(find('.tag-creator')).to.exist;
    });

  it('stops tag creation when tags number changes and it exceeds tags limit',
    async function () {
      const tags = this.get('tags');

      await render(hbs `{{tags-input
        tagsLimit=3
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      await click('.tag-creator-trigger');
      this.set('tags', [...tags, ...tags]);
      await settled();

      expect($(find('.tags-input'))).to.not.have.class('creating-tag');
      expect(find('.tag-creator')).to.not.exist;
    });

  it('does not show clear-input button when input is not empty and isClearButtonVisible is false',
    async function () {
      await render(hbs `{{tags-input tags=tags isClearButtonVisible=false}}`);

      expect(find('.input-clear-trigger')).to.not.exist;
    });

  it('does not show clear-input button when input is empty and isClearButtonVisible is true',
    async function () {
      this.set('tags', []);

      await render(hbs `{{tags-input tags=tags isClearButtonVisible=true}}`);

      expect(find('.input-clear-trigger')).to.not.exist;
    });

  it('has working clear-input button when input is not empty and isClearButtonVisible is true',
    async function () {
      this.set('change', tags => this.set('tags', tags));
      await render(hbs `{{tags-input
        tags=tags
        isClearButtonVisible=true
        onChange=change
      }}`);

      const clearBtn = find('.input-clear-trigger');
      expect(clearBtn).to.exist;
      await click(clearBtn);
      expect(this.get('tags')).to.have.length(0);
    });
});

async function getCreateTriggerTip() {
  const helper = new OneTooltipHelper('.tag-creator-trigger');
  return (await helper.hasTooltip()) ? (await helper.getText()) : undefined;
}
