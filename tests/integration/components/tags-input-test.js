import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click, focus, blur } from 'ember-native-dom-helpers';
import { get, set } from '@ember/object';
import wait from 'ember-test-helpers/wait';
import OneTooltipHelper from '../../helpers/one-tooltip';

const disabledCreateTriggerTip = 'Maximum number of elements has been reached.';

describe('Integration | Component | tags input', function () {
  setupComponentTest('tags-input', {
    integration: true,
  });

  beforeEach(function () {
    this.set('tags', [{
      label: 'a',
    }, {
      label: 'b',
    }]);
  });

  it('has class "tags-input"', function () {
    this.render(hbs `{{tags-input}}`);

    expect(this.$('.tags-input')).to.exist;
  });

  it('shows passed tags', function () {
    this.render(hbs `{{tags-input tags=tags}}`);

    const $tags = this.$('.tag-item');
    expect($tags).to.have.length(2);
    expect($tags.eq(0).text().trim()).to.equal('a');
    expect($tags.eq(1).text().trim()).to.equal('b');
  });

  it('shows tags icons', function () {
    this.set('tags.firstObject.icon', 'space');

    this.render(hbs `{{tags-input tags=tags}}`);

    expect(this.$('.tag-item:nth-child(1) .tag-icon'))
      .to.have.class('oneicon-space');
    expect(this.$('.tag-item:nth-child(2) .tag-icon')).to.not.exist;
  });

  it('removes tags via remove icon on each tag', function () {
    const oldTags = this.get('tags').slice(0);
    const changeSpy = sinon.spy(tags => this.set('tags', tags));
    this.on('change', changeSpy);

    this.render(hbs `{{tags-input tags=tags onChange=(action "change")}}`);

    return click('.tag-item:first-child .tag-remove')
      .then(() => {
        const $tagItem = this.$('.tag-item');
        expect($tagItem).to.have.length(1);
        expect($tagItem.text().trim()).to.equal(oldTags[1].label);
        expect(changeSpy).to.be.calledOnce;
        expect(changeSpy.lastCall.args[0].toArray())
          .to.deep.equal(oldTags.slice(1).toArray());
      });
  });

  it(
    'does not perform tag removing if "onChange" property is not specified',
    function () {
      this.render(hbs `{{tags-input tags=tags}}`);

      return click('.tag-item:first-child .tag-remove')
        .then(() => expect(this.$('.tag-item')).to.have.length(2));
    }
  );

  it(
    'notifies about lost focus through onFocusLost',
    function () {
      const focusLostSpy = sinon.spy();
      this.on('focusLost', focusLostSpy);

      this.render(hbs `
        {{tags-input tags=tags onFocusLost=(action "focusLost")}}
      `);

      return focus('.tags-input')
        .then(() => {
          expect(focusLostSpy).to.be.not.called;

          return blur('.tags-input');
        })
        .then(() => expect(focusLostSpy).to.be.calledOnce);
    }
  );

  it(
    'goes into creating new tag mode on tag-creator-trigger click',
    function () {
      this.render(hbs `{{tags-input tags=tags}}`);

      expect(this.$('.tag-creator')).to.not.exist;
      return click('.tag-creator-trigger')
        .then(() => {
          expect(this.$('.tags-input')).to.have.class('creating-tag');
          expect(this.$('.tag-creator')).to.exist;
        });
    }
  );

  it(
    'goes into creating new tag mode on click',
    function () {
      this.render(hbs `{{tags-input tags=tags}}`);

      return click('.tags-input')
        .then(() => {
          expect(this.$('.tags-input')).to.have.class('creating-tag');
          expect(this.$('.tag-creator')).to.exist;
        });
    }
  );

  it(
    'uses "tagEditorComponentName" property to render tag creation editor component',
    function () {
      this.render(hbs `
        {{tags-input tags=tags tagEditorComponentName="test-component"}}
      `);

      return click('.tag-creator-trigger')
        .then(() => expect(this.$('.tag-creator .test-component')).to.exist);
    }
  );

  it(
    'uses tags-input/text-editor as a default tag creation editor component',
    function () {
      this.render(hbs `{{tags-input tags=tags}}`);

      return click('.tag-creator-trigger')
        .then(() => expect(this.$('.tag-creator .tags-input-text-editor')).to.exist);
    }
  );

  it(
    'allows to end creating tag operation from within tag creation editor',
    function () {
      this.render(hbs `
        {{tags-input tags=tags tagEditorComponentName="test-component"}}
      `);

      return click('.tag-creator-trigger')
        .then(() => {
          const testComponent =
            this.$('.tag-creator .test-component')[0].componentInstance;
          get(testComponent, 'onEndTagCreation')();
          return wait();
        })
        .then(() => {
          expect(this.$('.tags-input')).to.not.have.class('creating-tag');
          expect(this.$('.tag-creator')).to.not.exist;
        });
    }
  );

  it(
    'allows to add tags through "onTagsAdded" action passed to tag creation editor',
    function () {
      const newTags = [{
        label: 'c',
      }, {
        label: 'd',
      }];
      const changeSpy = sinon.spy();
      this.on('change', changeSpy);
      this.render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="test-component"
        onChange=(action "change")
      }}`);

      return click('.tag-creator-trigger')
        .then(() => {
          const testComponent =
            this.$('.tag-creator .test-component')[0].componentInstance;
          get(testComponent, 'onTagsAdded')(newTags);
          return wait();
        })
        .then(() => {
          expect(changeSpy).to.be.calledWith(sinon.match.has('length', 4));
        });
    }
  );

  it(
    'injects currently selected tags into creation editor',
    function () {
      this.render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      let testComponent;
      return click('.tag-creator-trigger')
        .then(() => {
          testComponent =
            this.$('.tag-creator .test-component')[0].componentInstance;
          expect(get(testComponent, 'selectedTags')).to.equal(this.get('tags'));
        });
    }
  );

  it('injects tags limit into creation editor', async function () {
    this.render(hbs `{{tags-input
      tags=tags
      tagsLimit=10
      tagEditorComponentName="test-component"
    }}`);

    await click('.tag-creator-trigger');

    const testComponent =
      this.$('.tag-creator .test-component')[0].componentInstance;
    expect(get(testComponent, 'tagsLimit')).to.equal(10 - this.get('tags.length'));
  });

  it('injects undefined tags limit into creation editor when tags limit is not defined',
    async function () {
      this.render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      await click('.tag-creator-trigger');

      const testComponent =
        this.$('.tag-creator .test-component')[0].componentInstance;
      expect(get(testComponent, 'tagsLimit')).to.be.undefined;
    });

  it(
    'passess tagEditorSettings to the tag creation editor',
    function () {
      const settings = Object.freeze({
        a: 1,
      });
      this.set('settings', settings);

      this.render(hbs `{{tags-input
        tagEditorComponentName="test-component"
        tagEditorSettings=settings
      }}`);

      return click('.tag-creator-trigger')
        .then(() => {
          const testComponent =
            this.$('.tag-creator .test-component')[0].componentInstance;

          expect(get(testComponent, 'settings')).to.deep.equal(settings);
        });
    }
  );

  it(
    'focuses editor after tag-creator-trigger click in creation mode',
    function () {
      const focusSpy = sinon.spy();

      this.render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      return click('.tag-creator-trigger')
        .then(() => {
          const testComponent =
            this.$('.tag-creator .test-component')[0].componentInstance;
          set(testComponent, 'focusIn', focusSpy);

          return click('.tag-creator-trigger');
        })
        .then(() => expect(focusSpy).to.be.calledOnce);
    }
  );

  it(
    'does not allow to add and remove tags when disabled',
    function () {
      this.render(hbs `{{tags-input
        disabled=true
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      const $tagsInput = this.$('.tags-input');
      expect($tagsInput).to.have.attr('disabled');
      expect(this.$('.tag-creator-trigger')).to.not.exist;
      expect(this.$('.tag-remove')).to.not.exist;
      return click('.tags-input')
        .then(() => {
          expect($tagsInput).to.not.have.class('creating-tag');
          expect(this.$('.tag-creator')).to.not.exist;
        });
    }
  );

  it(
    'stops tag creation when becomes disabled',
    function () {
      this.set('disabled', false);

      this.render(hbs `{{tags-input
        disabled=disabled
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      return click('.tags-input')
        .then(() => {
          this.set('disabled', true);
          return wait();
        })
        .then(() => {
          expect(this.$('.tags-input')).to.not.have.class('creating-tag');
          expect(this.$('.tag-creator')).to.not.exist;
        });
    }
  );

  it(
    'does not allow to add and remove tags in readonly mode',
    function () {
      this.render(hbs `{{tags-input
        readonly=true
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      const $tagsInput = this.$('.tags-input');
      expect($tagsInput).to.have.class('readonly');
      expect(this.$('.tag-creator-trigger')).to.not.exist;
      expect(this.$('.tag-remove')).to.not.exist;
      return click('.tags-input')
        .then(() => {
          expect($tagsInput).to.not.have.class('creating-tag');
          expect(this.$('.tag-creator')).to.not.exist;
        });
    }
  );

  it(
    'stops tag creation when becomes readonly',
    function () {
      this.set('readonly', false);

      this.render(hbs `{{tags-input
        readonly=readonly
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      return click('.tags-input')
        .then(() => {
          this.set('readonly', true);
          return wait();
        })
        .then(() => {
          expect(this.$('.tags-input')).to.not.have.class('creating-tag');
          expect(this.$('.tag-creator')).to.not.exist;
        });
    }
  );

  it('disables tag creation when number of already provided tags is equal to the limit',
    async function () {
      this.render(hbs `{{tags-input
        tags=tags
        tagsLimit=tags.length
        tagEditorComponentName="test-component"
      }}`);

      const $createTrigger = this.$('.tag-creator-trigger');
      expect($createTrigger).to.have.class('disabled');
      await click($createTrigger[0]);

      expect(this.$('.tag-creator')).to.not.exist;
      expect(await getCreateTriggerTip()).to.equal(disabledCreateTriggerTip);
    });

  it('disables tag creation when number of already provided tags is greater that the limit',
    async function () {
      this.render(hbs `{{tags-input
        tags=tags
        tagsLimit=0
        tagEditorComponentName="test-component"
      }}`);

      const $createTrigger = this.$('.tag-creator-trigger');
      expect($createTrigger).to.have.class('disabled');
      await click($createTrigger[0]);

      expect(this.$('.tag-creator')).to.not.exist;
      expect(await getCreateTriggerTip()).to.equal(disabledCreateTriggerTip);
    });

  it('does not disable tag creation when number of already provided tags is lower that the limit',
    async function () {
      this.set('tagsLimit', this.get('tags.length') + 1);
      this.render(hbs `{{tags-input
        tags=tags
        tagsLimit=9999
        tagEditorComponentName="test-component"
      }}`);

      const $createTrigger = this.$('.tag-creator-trigger');
      expect($createTrigger).to.not.have.class('disabled');
      await click($createTrigger[0]);

      expect(this.$('.tag-creator')).to.exist;
      expect(await getCreateTriggerTip()).to.be.undefined;
    });

  it('stops tag creation when tags limit changes and tags number exceeds it',
    async function () {
      this.set('tagsLimit', 10);

      this.render(hbs `{{tags-input
        tagsLimit=tagsLimit
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      await click('.tag-creator-trigger');
      this.set('tagsLimit', 1);
      await wait();

      expect(this.$('.tags-input')).to.not.have.class('creating-tag');
      expect(this.$('.tag-creator')).to.not.exist;
    });

  it('does not stop tag creation when tags limit changes and tags number is within it',
    async function () {
      this.set('tagsLimit', 10);

      this.render(hbs `{{tags-input
        tagsLimit=tagsLimit
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      await click('.tag-creator-trigger');
      this.set('tagsLimit', 8);
      await wait();

      expect(this.$('.tags-input')).to.have.class('creating-tag');
      expect(this.$('.tag-creator')).to.exist;
    });

  it('stops tag creation when tags number changes and it exceeds tags limit',
    async function () {
      const tags = this.get('tags');

      this.render(hbs `{{tags-input
        tagsLimit=3
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      await click('.tag-creator-trigger');
      this.set('tags', [...tags, ...tags]);
      await wait();

      expect(this.$('.tags-input')).to.not.have.class('creating-tag');
      expect(this.$('.tag-creator')).to.not.exist;
    });
});

async function getCreateTriggerTip() {
  const helper = new OneTooltipHelper('.tag-creator-trigger');
  return (await helper.hasTooltip()) ? (await helper.getText()) : undefined;
}
