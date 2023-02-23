import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { getSlide } from '../../helpers/one-carousel';

describe('Integration | Component | one-carousel', function () {
  setupRenderingTest();

  it('has class "one-carousel"', async function () {
    await render(hbs `{{one-carousel}}`);
    expect(findAll('.one-carousel')).to.have.length(1);
  });

  it('does not render any slide, when empty', async function () {
    await render(hbs `{{#one-carousel}}{{/one-carousel}}`);
    expect(find('.one-carousel-slide')).to.not.exist;
  });

  it('renders slides', async function () {
    await render(hbs `
      {{#one-carousel as |carousel|}}
        {{#carousel.slide slideId="first"}}
          slide 1
        {{/carousel.slide}}
        {{#carousel.slide slideId="second"}}
          slide 2
        {{/carousel.slide}}
      {{/one-carousel}}
    `);

    expect(findAll('.one-carousel-slide')).to.have.length(2);
    expect(getSlide('first').textContent).to.contain('slide 1');
    expect(getSlide('second').textContent).to.contain('slide 2');
  });

  it('shows active slide', async function () {
    await render(hbs `
      {{#one-carousel activeSlideId="second" as |carousel|}}
        {{carousel.slide slideId="first"}}
        {{carousel.slide slideId="second"}}
      {{/one-carousel}}
    `);

    expect(getSlide('second').classList.contains('active')).to.be.true;
    expect(getSlide('first').classList.contains('hidden')).to.be.true;
  });

  it('allows to change slide to next one', async function () {
    this.set('activeSlideId', 'first');
    await render(hbs `
      {{#one-carousel activeSlideId=activeSlideId as |carousel|}}
        {{carousel.slide slideId="first"}}
        {{carousel.slide slideId="second"}}
      {{/one-carousel}}
    `);
    this.set('activeSlideId', 'second');

    expect(getSlide('first').classList.contains('hidden-to-left')).to.be.true;
    expect(getSlide('second').classList.contains('active-from-right')).to.be.true;
  });

  it('allows to change slide to previous one', async function () {
    this.set('activeSlideId', 'second');
    await render(hbs `
      {{#one-carousel activeSlideId=activeSlideId as |carousel|}}
        {{carousel.slide slideId="first"}}
        {{carousel.slide slideId="second"}}
      {{/one-carousel}}
    `);
    this.set('activeSlideId', 'first');

    expect(getSlide('first').classList.contains('active-from-left')).to.be.true;
    expect(getSlide('second').classList.contains('hidden-to-right')).to.be.true;
  });

  it('does not show any slide if active slide does not exist', async function () {
    await render(hbs `
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
      expect(find(`.one-carousel-slide.${state}`)).to.not.exist
    );
  });
});
