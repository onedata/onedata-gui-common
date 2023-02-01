import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import OneTooltipHelper from '../../helpers/one-tooltip';

describe('Integration | Component | one way toggle', function () {
  setupRenderingTest();

  it('renders checked toggle when passed checked value true', async function () {
    await render(hbs `{{one-way-toggle checked=true}}`);

    const toggle = find('.one-way-toggle');
    expect(toggle).to.have.class('checked');
  });

  it('renders unchecked toggle when passed checked value false', async function () {
    await render(hbs `{{one-way-toggle checked=false}}`);

    const toggle = find('.one-way-toggle');
    expect(toggle).to.not.have.class('checked');
    // TODO: VFS-7482 refactor to unchecked (when acceptance tests will be ready)
    expect(toggle).to.have.class('unselected');
  });

  it('renders half-selected toggle when passed checked value 2 and threeState=true',
    async function () {
      await render(hbs `{{one-way-toggle threeState=true checked=2}}`);

      const toggle = find('.one-way-toggle');
      expect(toggle).to.have.class('maybe');
    }
  );

  it('can be checked', async function () {
    this.set('checked', false);
    const updateHandler = sinon.spy((value) => this.set('checked', value));
    this.set('update', updateHandler);

    await render(hbs `{{one-way-toggle checked=checked update=(action update)}}`);

    await click('.one-way-toggle');

    expect(find('.one-way-toggle')).to.have.class('checked');
    expect(updateHandler).to.be.calledOnce;
    expect(updateHandler).to.be.calledWith(true);
  });

  it('can be unchecked', async function () {
    this.set('checked', true);
    const updateHandler = sinon.spy((value) => this.set('checked', value));
    this.set('update', updateHandler);

    await render(hbs `{{one-way-toggle checked=checked update=(action update)}}`);

    await click('.one-way-toggle');

    expect(find('.one-way-toggle')).to.not.have.class('checked');
    expect(updateHandler).to.be.calledOnce;
    expect(updateHandler).to.be.calledWith(false);
  });

  it('cannot be semi-checked when threeState=true', async function () {
    this.set('checked', false);
    const updateHandler = sinon.spy((value) => this.set('checked', value));
    this.set('update', updateHandler);

    await render(hbs `
      {{one-way-toggle
        checked=checked
        threeState=true
        update=(action update)}}
    `);

    await click('.one-way-toggle');

    expect(find('.one-way-toggle')).to.have.class('checked');
    expect(find('.one-way-toggle')).to.not.have.class('maybe');
    expect(updateHandler).to.be.calledOnce;
    expect(updateHandler).to.be.calledWith(true);
  });

  it('can be semi-checked when threeState=true and allowThreeStateToggle=true',
    async function () {
      this.set('checked', false);
      const updateHandler = sinon.spy((value) => this.set('checked', value));
      this.set('update', updateHandler);

      await render(hbs `
        {{one-way-toggle
          checked=checked
          threeState=true
          allowThreeStateToggle=true
          update=(action update)}}
      `);

      await click('.one-way-toggle');

      expect(find('.one-way-toggle')).to.not.have.class('checked');
      expect(find('.one-way-toggle')).to.have.class('maybe');
      expect(updateHandler).to.be.calledOnce;
      expect(updateHandler).to.be.calledWith(2);
    }
  );

  it('can be checked when threeState=true and allowThreeStateToggle=true',
    async function () {
      this.set('checked', 2);
      const updateHandler = sinon.spy((value) => this.set('checked', value));
      this.set('update', updateHandler);

      await render(hbs `
        {{one-way-toggle
          checked=checked
          threeState=true
          allowThreeStateToggle=true
          update=(action update)}}
      `);

      await click('.one-way-toggle');

      expect(find('.one-way-toggle')).to.have.class('checked');
      expect(find('.one-way-toggle')).to.not.have.class('maybe');
      expect(updateHandler).to.be.calledOnce;
      expect(updateHandler).to.be.calledWith(true);
    }
  );

  it('can be unchecked when threeState=true and allowThreeStateToggle=true',
    async function () {
      this.set('checked', true);
      const updateHandler = sinon.spy((value) => this.set('checked', value));
      this.set('update', updateHandler);

      await render(hbs `
        {{one-way-toggle
          checked=checked
          threeState=true
          allowThreeStateToggle=true
          update=(action update)}}
      `);

      await click('.one-way-toggle');

      expect(find('.one-way-toggle')).to.not.have.class('checked');
      expect(find('.one-way-toggle')).to.not.have.class('maybe');
      expect(updateHandler).to.be.calledOnce;
      expect(updateHandler).to.be.calledWith(false);
    }
  );

  it('disables toggle until update promise is resolved', async function () {
    this.set('checked', false);
    let resolvePromise;
    const updateHandler = (value) => {
      return new Promise(resolve => {
        resolvePromise = () => {
          this.set('checked', value);
          resolve();
        };
      });
    };

    this.set('update', updateHandler);

    await render(hbs `
      {{one-way-toggle
        checked=checked
        update=(action update)}}
    `);

    const oneWayToggle = find('.one-way-toggle');

    await click('.one-way-toggle');
    expect(oneWayToggle, 'disable right after click')
      .to.have.class('disabled');
    expect(oneWayToggle, 'check right after click')
      .to.have.class('checked');

    resolvePromise();
    await settled();
    expect(oneWayToggle, 'enabled after action resolve')
      .to.not.have.class('disabled');
    expect(oneWayToggle, 'checked after action resolve')
      .to.have.class('checked');
  });

  it('has tooltip when "tip" is specified', async function () {
    await render(hbs `{{one-way-toggle tip="my tip"}}`);

    const tooltipHelper = new OneTooltipHelper('.one-way-toggle-control');
    expect(await tooltipHelper.getText()).to.equal('my tip');
  });

  it('has tooltip when is readonly', async function () {
    await render(hbs `{{one-way-toggle isReadOnly=true}}`);

    const tooltipHelper = new OneTooltipHelper('.one-way-toggle-control');
    expect(await tooltipHelper.getText()).to.equal('Locked');
  });

  it('has tooltip from "tip" when "tip" is specified and is readonly', async function () {
    await render(hbs `{{one-way-toggle isReadOnly=true tip="my tip"}}`);

    const tooltipHelper = new OneTooltipHelper('.one-way-toggle-control');
    expect(await tooltipHelper.getText()).to.equal('my tip');
  });

  it('has no tooltip by default', async function () {
    await render(hbs `{{one-way-toggle}}`);

    const tooltipHelper = new OneTooltipHelper('.one-way-toggle-control');
    expect(await tooltipHelper.hasTooltip()).to.be.false;
  });

  it('has tooltip when "tip" is specified', async function () {
    await render(hbs `{{one-way-toggle tip="my tip"}}`);

    const tooltipHelper = new OneTooltipHelper('.one-way-toggle-control');
    expect(await tooltipHelper.getText()).to.equal('my tip');
  });

  it('has "lock" icon when is readonly', async function () {
    await render(hbs `{{one-way-toggle isReadOnly=true}}`);

    expect(getToggle().querySelector('.one-icon')).to.have.class('oneicon-lock');
  });

  it('has no "lock" icon when is not readonly', async function () {
    await render(hbs `{{one-way-toggle isReadOnly=false}}`);

    expect(getToggle().querySelector('.one-icon')).to.not.exist;
  });

  it('has no "lock" icon when is readonly but "showLockForReadOnly" is false', async function () {
    await render(hbs `{{one-way-toggle isReadOnly=true showLockForReadOnly=false}}`);

    expect(getToggle().querySelector('.one-icon')).to.not.exist;
  });

  function getToggle() {
    return find('.one-way-toggle');
  }
});
