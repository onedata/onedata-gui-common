import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';

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
});
