/* eslint-disable no-undef */
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { registerService, lookupService } from '../../helpers/stub-service';
import Service from '@ember/service';
import $ from 'jquery';
import { setProperties } from '@ember/object';

describe('Integration | Component | alert global', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'alert', Service);
    this.set('alert', lookupService(this, 'alert'));
  });

  it('is opened when alert.opened is true', async function () {
    this.set('alert.opened', true);

    await render(hbs `{{alert-global}}`);

    expect(getModal()).to.exist;
  });

  it('is closed when alert.opened is false', async function () {
    this.set('alert.opened', false);

    await render(hbs `{{alert-global}}`);

    expect(getModal()).to.not.exist;
  });

  it('can be closed using "Close" button', async function () {
    this.set('alert.opened', true);

    await render(hbs `{{alert-global}}`);
    await click(getModal().find('.close-alert-modal')[0]);

    expect(this.get('alert.opened')).to.be.false;
  });

  [
    { type: 'error', icon: 'sign-error-rounded' },
    { type: 'warning', icon: 'sign-warning-rounded' },
    { type: 'info', icon: 'sign-info-rounded' },
    { type: undefined, icon: 'sign-info-rounded' },
  ].forEach(({ type, icon }) => {
    it(`uses ${icon} icon for ${type} type`, async function () {
      setProperties(this.get('alert'), {
        opened: true,
        type,
      });

      await render(hbs `{{alert-global}}`);

      expect(getModal().find('.header-icon')).to.have.class(`oneicon-${icon}`);
    });
  });

  [
    { type: 'error', btnClass: 'btn-danger' },
    { type: 'warning', btnClass: 'btn-warning' },
    { type: 'info', btnClass: 'btn-default' },
    { type: undefined, btnClass: 'btn-default' },
  ].forEach(({ type, btnClass }) => {
    it(`uses ${btnClass} close button for ${type} type`, async function () {
      setProperties(this.get('alert'), {
        opened: true,
        type,
      });

      await render(hbs `{{alert-global}}`);

      expect(getModal().find('.close-alert-modal')).to.have.class(btnClass);
    });
  });

  [
    { type: 'error', header: 'Error' },
    { type: 'warning', header: 'Warning' },
    { type: 'info', header: 'Notice' },
    { type: undefined, header: 'Notice' },
  ].forEach(({ type, header }) => {
    it(`shows "${header}" header for ${type} type`, async function () {
      setProperties(this.get('alert'), {
        opened: true,
        type,
      });

      await render(hbs `{{alert-global}}`);

      expect(getModal().find('h1').text()).to.contain(header);
    });
  });

  it('shows passed text in modal content', async function () {
    const text = 'abcdf';
    setProperties(this.get('alert'), {
      opened: true,
      text,
    });

    await render(hbs `{{alert-global}}`);

    expect(getModal().find('.modal-body').text()).to.contain(text);
  });

  it('shows details expanding link, when details are available', async function () {
    setProperties(this.get('alert'), {
      opened: true,
      detailsText: 'asdf',
    });

    await render(hbs `{{alert-global}}`);

    expect(getModal().find('.toggle-details-link')).to.exist;
  });

  it('does not show details expanding link, when details are not available', async function () {
    this.set('alert.opened', true);

    await render(hbs `{{alert-global}}`);

    expect(getModal().find('.toggle-details-link')).to.not.exist;
  });

  [
    { type: 'error', textClass: 'text-danger' },
    { type: 'warning', textClass: 'text-warning' },
  ].forEach(({ type, textClass }) => {
    it(
      `adds ${textClass || 'no'} class to details expanding link for ${type} type`,
      async function () {
        setProperties(this.get('alert'), {
          opened: true,
          type,
          detailsText: 'asdf',
        });

        await render(hbs `{{alert-global}}`);

        expect(getModal().find('.toggle-details-link')).to.have.class(textClass);
      }
    );
  });

  it(
    'shows "Show details" and down arrow for details expanding link when details are collapsed',
    async function () {
      setProperties(this.get('alert'), {
        opened: true,
        detailsText: 'asdf',
      });

      await render(hbs `{{alert-global}}`);

      expect(getModal().find('.toggle-details-link').text())
        .to.contain('Show details');
      expect(getModal().find('.toggle-details-link .oneicon-arrow-down')).to.exist;
    }
  );

  it(
    'shows "Hide details" and up arrow for details expanding link when details are expanded',
    async function () {
      setProperties(this.get('alert'), {
        opened: true,
        detailsText: 'asdf',
      });

      await render(hbs `{{alert-global}}`);
      await click(getModal().find('.toggle-details-link')[0]);

      expect(getModal().find('.toggle-details-link').text())
        .to.contain('Hide details');
      expect(getModal().find('.toggle-details-link .oneicon-arrow-up')).to.exist;
    }
  );

  it('shows details text after click on details expanding link', async function () {
    setProperties(this.get('alert'), {
      opened: true,
      detailsText: 'asdf',
    });

    await render(hbs `{{alert-global}}`);
    await click(getModal().find('.toggle-details-link')[0]);

    expect(getModal().find('.details-collapse')).to.have.class('in');
  });

  it('hides details text after second click on details expanding link', async function () {
    setProperties(this.get('alert'), {
      opened: true,
      detailsText: 'asdf',
    });

    await render(hbs `{{alert-global}}`);
    await click(getModal().find('.toggle-details-link')[0]);
    await click(getModal().find('.toggle-details-link')[0]);

    expect(getModal().find('.details-collapse')).to.not.have.class('in');
  });

  it('always shows details when alert.alwaysShowDetails is true', async function () {
    setProperties(this.get('alert'), {
      opened: true,
      detailsText: 'asdf',
      alwaysShowDetails: true,
    });

    await render(hbs `{{alert-global}}`);

    expect(getModal().find('.toggle-details-link')).to.not.exist;
    expect(getModal().find('.details-collapse')).to.have.class('in');
  });
});

function getModal() {
  return $('.modal.in');
}
