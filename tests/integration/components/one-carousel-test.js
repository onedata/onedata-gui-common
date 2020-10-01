import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one carousel', function () {
  setupComponentTest('one-carousel', {
    integration: true,
  });

  it('has class "one-carousel"', function () {
    this.render(hbs `{{one-carousel}}`);
    expect(this.$('.one-carousel')).to.have.length(1);
  });

  it('does not render any slide, when empty', function () {
    this.render(hbs `{{#one-carousel}}{{/one-carousel}}`);
    expect(this.$('.one-carousel-slide')).to.not.exist;
  });

  it('renders slides', function () {
    this.render(hbs `
      {{#one-carousel as |carousel|}}
        {{#carousel.slide slideId="first"}}
          slide 1
        {{/carousel.slide}}
        {{#carousel.slide slideId="second"}}
          slide 2
        {{/carousel.slide}}
      {{/one-carousel}}
    `);

    expect(this.$('.one-carousel-slide')).to.have.length(2);
    expect(getSlideById(this, 'first').text()).to.contain('slide 1');
    expect(getSlideById(this, 'second').text()).to.contain('slide 2');
  });

  it('shows active slide', function () {
    this.render(hbs `
      {{#one-carousel activeSlideId="second" as |carousel|}}
        {{carousel.slide slideId="first"}}
        {{carousel.slide slideId="second"}}
      {{/one-carousel}}
    `);

    expect(getSlideById(this, 'second')).to.have.class('active');
    expect(getSlideById(this, 'first')).to.have.class('hidden');
  });

  it('allows to change slide to next one', function () {
    this.set('activeSlideId', 'first');
    this.render(hbs `
      {{#one-carousel activeSlideId=activeSlideId as |carousel|}}
        {{carousel.slide slideId="first"}}
        {{carousel.slide slideId="second"}}
      {{/one-carousel}}
    `);
    this.set('activeSlideId', 'second');

    expect(getSlideById(this, 'first')).to.have.class('hidden-to-left');
    expect(getSlideById(this, 'second')).to.have.class('active-from-right');
  });

  it('allows to change slide to previous one', function () {
    this.set('activeSlideId', 'second');
    this.render(hbs `
      {{#one-carousel activeSlideId=activeSlideId as |carousel|}}
        {{carousel.slide slideId="first"}}
        {{carousel.slide slideId="second"}}
      {{/one-carousel}}
    `);
    this.set('activeSlideId', 'first');

    expect(getSlideById(this, 'first')).to.have.class('active-from-left');
    expect(getSlideById(this, 'second')).to.have.class('hidden-to-right');
  });

  it('does not show any slide if active slide does not exist', function () {
    this.render(hbs `
      {{#one-carousel activeSlideId="third" as |carousel|}}
        {{carousel.slide slideId="first"}}
        {{carousel.slide slideId="second"}}
      {{/one-carousel}}
    `);

    [
      'active',
      'active-from-left',
      'active-from-right',
    ].forEach(state =>
      expect(this.$(`.one-carousel-slide.${state}`)).to.not.exist
    );
  });
});

function getSlideById(testCase, slideId) {
  return testCase.$(`[data-one-carousel-slide-id='${slideId}'`);
}
