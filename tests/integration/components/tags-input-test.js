import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click, focus, blur } from 'ember-native-dom-helpers';
import { get, set } from '@ember/object';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | tags input', function () {
  setupComponentTest('tags-input', {
    integration: true
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
    const changeSpy = sinon.spy((tags) => this.set('tags', tags));
    this.on('change', changeSpy);

    this.render(hbs `{{tags-input tags=tags onChange=(action "change")}}`);

    return click('.tag-item:first-child .tag-remove')
      .then(() => {
        const $tagItem = this.$('.tag-item');
        expect($tagItem).to.have.length(1);
        expect($tagItem.text().trim()).to.equal(oldTags[1].label);
        expect(changeSpy).to.be.calledOnce;
        expect(changeSpy).to.be.calledWith(oldTags.slice(1));
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

          return blur('.tags-input .text-editor-input');
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
    'goes into creating new tag mode on focus',
    function () {
      this.render(hbs `{{tags-input tags=tags}}`);

      return focus('.tags-input')
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
    'injects current newTags (creation editor state) into creation editor',
    function () {
      const newTags = [{
        label: 'c',
      }, {
        label: 'd',
      }];
      this.render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      let testComponent;
      return click('.tag-creator-trigger')
        .then(() => {
          testComponent =
            this.$('.tag-creator .test-component')[0].componentInstance;
          expect(get(testComponent, 'newTags')).to.have.length(0);

          get(testComponent, 'onTagsChanged')(newTags);
          return wait();
        })
        .then(() => expect(get(testComponent, 'newTags')).to.deep.equal(newTags));
    }
  );

  it(
    'adding new tags removes them from newTags array passed into the tag creation editor',
    function () {
      const newTags = [{
        label: 'c',
      }, {
        label: 'd',
      }];
      this.on('change', (tags) => this.set('tags', tags));
      this.render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="test-component"
        onChange=(action "change")
      }}`);

      let testComponent;
      return click('.tag-creator-trigger')
        .then(() => {
          testComponent =
            this.$('.tag-creator .test-component')[0].componentInstance;

          get(testComponent, 'onTagsChanged')(newTags);
          get(testComponent, 'onTagsAdded')(newTags.slice(1));
          return wait();
        })
        .then(() =>
          expect(get(testComponent, 'newTags')).to.deep.equal(newTags.slice(0, 1))
        );
    }
  );

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
    'adds tags remembered in newTags on tag-creator-trigger click in creation mode',
    function () {
      const newTags = [{
        label: 'b',
      }, {
        label: 'c',
      }];
      const existingTags = [{
        label: 'a',
      }];
      this.set('tags', existingTags);
      const changeSpy = sinon.spy((tags) => this.set('tags', tags));
      this.on('change', changeSpy);
      this.render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="test-component"
        onChange=(action "change")
      }}`);

      let testComponent;
      return click('.tag-creator-trigger')
        .then(() => {
          testComponent =
            this.$('.tag-creator .test-component')[0].componentInstance;

          get(testComponent, 'onTagsChanged')(newTags);
          return click('.tag-creator-trigger');
        })
        .then(() => {
          expect(changeSpy.lastCall).to.be.calledWith(existingTags.concat(newTags));
          expect(get(testComponent, 'newTags')).to.have.length(0);
        });
    }
  );

  it(
    'focuses editor after tag-creator-trigger click in creation mode',
    function () {
      const newTags = [{
        label: 'b',
      }, {
        label: 'c',
      }];
      const focusSpy = sinon.spy();

      this.render(hbs `{{tags-input
        tags=tags
        tagEditorComponentName="test-component"
      }}`);

      let testComponent;
      return click('.tag-creator-trigger')
        .then(() => {
          testComponent =
            this.$('.tag-creator .test-component')[0].componentInstance;
          set(testComponent, 'focusIn', focusSpy);

          get(testComponent, 'onTagsChanged')(newTags);
          return click('.tag-creator-trigger');
        })
        .then(() => expect(focusSpy).to.be.calledOnce);
    }
  );
});
