import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { registerService, lookupService } from '../../helpers/stub-service';
import Service from '@ember/service';
import { setProperties } from '@ember/object';
import globals from 'onedata-gui-common/utils/globals';

describe('Integration | Component | alert-global', function () {
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
    await click(getModal().querySelector('.close-alert-modal'));

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

      expect(getModal().querySelector('.header-icon')).to.have.class(`oneicon-${icon}`);
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

      expect(getModal().querySelector('.close-alert-modal')).to.have.class(btnClass);
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

      expect(getModal().querySelector('h1').textContent).to.contain(header);
    });
  });

  it('shows passed text in modal content', async function () {
    const text = 'abcdf';
    setProperties(this.get('alert'), {
      opened: true,
      text,
    });

    await render(hbs `{{alert-global}}`);

    expect(getModal().querySelector('.modal-body').textContent).to.contain(text);
  });

  it('shows details expanding link, when details are available', async function () {
    setProperties(this.get('alert'), {
      opened: true,
      detailsText: 'asdf',
    });

    await render(hbs `{{alert-global}}`);

    expect(getModal().querySelector('.toggle-details-link')).to.exist;
  });

  it('does not show details expanding link, when details are not available', async function () {
    this.set('alert.opened', true);

    await render(hbs `{{alert-global}}`);

    expect(getModal().querySelector('.toggle-details-link')).to.not.exist;
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

        expect(getModal().querySelector('.toggle-details-link')).to.have.class(textClass);
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

      expect(getModal().querySelector('.toggle-details-link').textContent)
        .to.contain('Show details');
      expect(getModal().querySelector('.toggle-details-link .oneicon-arrow-down')).to.exist;
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
      await click(getModal().querySelector('.toggle-details-link'));

      expect(getModal().querySelector('.toggle-details-link').textContent)
        .to.contain('Hide details');
      expect(getModal().querySelector('.toggle-details-link .oneicon-arrow-up')).to.exist;
    }
  );

  it('shows details text after click on details expanding link', async function () {
    setProperties(this.get('alert'), {
      opened: true,
      detailsText: 'asdf',
    });

    await render(hbs `{{alert-global}}`);
    await click(getModal().querySelector('.toggle-details-link'));

    expect(getModal().querySelector('.details-collapse')).to.have.class('in');
  });

  it('hides details text after second click on details expanding link', async function () {
    setProperties(this.get('alert'), {
      opened: true,
      detailsText: 'asdf',
    });

    await render(hbs `{{alert-global}}`);
    await click(getModal().querySelector('.toggle-details-link'));
    await click(getModal().querySelector('.toggle-details-link'));

    expect(getModal().querySelector('.details-collapse')).to.not.have.class('in');
  });

  it('always shows details when alert.alwaysShowDetails is true', async function () {
    setProperties(this.get('alert'), {
      opened: true,
      detailsText: 'asdf',
      alwaysShowDetails: true,
    });

    await render(hbs `{{alert-global}}`);

    expect(getModal().querySelector('.toggle-details-link')).to.not.exist;
    expect(getModal().querySelector('.details-collapse')).to.have.class('in');
  });
});

function getModal() {
  return globals.document.querySelector('.modal.in');
}
