import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { run } from '@ember/runloop';
import wait from 'ember-test-helpers/wait';
import { Promise } from 'rsvp';
import $ from 'jquery';
import OneTooltipHelper from '../../helpers/one-tooltip';

describe('Integration | Component | one way toggle', function () {
  setupRenderingTest();

  it('renders checked toggle when passed checked value true', async function () {
    await render(hbs `{{one-way-toggle checked=true}}`);

    let $toggle = this.$('.one-way-toggle');
    expect($toggle).to.have.class('checked');
  });

  it('renders unchecked toggle when passed checked value false', async function () {
    await render(hbs `{{one-way-toggle checked=false}}`);

    let $toggle = this.$('.one-way-toggle');
    expect($toggle).to.not.have.class('checked');
    // TODO: VFS-7482 refactor to unchecked (when acceptance tests will be ready)
    expect($toggle).to.have.class('unselected');
  });

  it('renders half-selected toggle when passed checked value 2 and threeState=true',
    async function () {
      await render(hbs `{{one-way-toggle threeState=true checked=2}}`);

      let $toggle = this.$('.one-way-toggle');
      expect($toggle).to.have.class('maybe');
    }
  );

  it('can be checked', async function (done) {
    this.set('checked', false);
    let updateHandler = sinon.spy((value) => this.set('checked', value));
    this.set('update', updateHandler);

    await render(hbs `{{one-way-toggle checked=checked update=(action update)}}`);

    click('.one-way-toggle').then(() => {
      expect(this.$('.one-way-toggle')).to.have.class('checked');
      expect(updateHandler).to.be.calledOnce;
      expect(updateHandler).to.be.calledWith(true);
      done();
    });
  });

  it('can be unchecked', async function (done) {
    this.set('checked', true);
    let updateHandler = sinon.spy((value) => this.set('checked', value));
    this.set('update', updateHandler);

    await render(hbs `{{one-way-toggle checked=checked update=(action update)}}`);

    click('.one-way-toggle').then(() => {
      expect(this.$('.one-way-toggle')).to.not.have.class('checked');
      expect(updateHandler).to.be.calledOnce;
      expect(updateHandler).to.be.calledWith(false);
      done();
    });
  });

  it('cannot be semi-checked when threeState=true', async function (done) {
    this.set('checked', false);
    let updateHandler = sinon.spy((value) => this.set('checked', value));
    this.set('update', updateHandler);

    await render(hbs `
      {{one-way-toggle
        checked=checked
        threeState=true
        update=(action update)}}
    `);

    click('.one-way-toggle').then(() => {
      expect(this.$('.one-way-toggle')).to.have.class('checked');
      expect(this.$('.one-way-toggle')).to.not.have.class('maybe');
      expect(updateHandler).to.be.calledOnce;
      expect(updateHandler).to.be.calledWith(true);
      done();
    });
  });

  it('can be semi-checked when threeState=true and allowThreeStateToggle=true',
    async function (done) {
      this.set('checked', false);
      let updateHandler = sinon.spy((value) => this.set('checked', value));
      this.set('update', updateHandler);

      await render(hbs `
        {{one-way-toggle
          checked=checked
          threeState=true
          allowThreeStateToggle=true
          update=(action update)}}
      `);

      click('.one-way-toggle').then(() => {
        expect(this.$('.one-way-toggle')).to.not.have.class('checked');
        expect(this.$('.one-way-toggle')).to.have.class('maybe');
        expect(updateHandler).to.be.calledOnce;
        expect(updateHandler).to.be.calledWith(2);
        done();
      });
    }
  );

  it('can be checked when threeState=true and allowThreeStateToggle=true',
    async function (done) {
      this.set('checked', 2);
      let updateHandler = sinon.spy((value) => this.set('checked', value));
      this.set('update', updateHandler);

      await render(hbs `
        {{one-way-toggle
          checked=checked
          threeState=true
          allowThreeStateToggle=true
          update=(action update)}}
      `);

      click('.one-way-toggle').then(() => {
        expect(this.$('.one-way-toggle')).to.have.class('checked');
        expect(this.$('.one-way-toggle')).to.not.have.class('maybe');
        expect(updateHandler).to.be.calledOnce;
        expect(updateHandler).to.be.calledWith(true);
        done();
      });
    }
  );

  it('can be unchecked when threeState=true and allowThreeStateToggle=true',
    async function (done) {
      this.set('checked', true);
      let updateHandler = sinon.spy((value) => this.set('checked', value));
      this.set('update', updateHandler);

      await render(hbs `
        {{one-way-toggle
          checked=checked
          threeState=true
          allowThreeStateToggle=true
          update=(action update)}}
      `);

      click('.one-way-toggle').then(() => {
        expect(this.$('.one-way-toggle')).to.not.have.class('checked');
        expect(this.$('.one-way-toggle')).to.not.have.class('maybe');
        expect(updateHandler).to.be.calledOnce;
        expect(updateHandler).to.be.calledWith(false);
        done();
      });
    }
  );

  it('disables toggle until update promise is resolved', async function (done) {
    this.set('checked', false);
    const updateHandler = (value) => {
      return new Promise(resolve => {
        run.later(() => {
          this.set('checked', value);
          resolve();
        }, 100);
      });
    };

    this.set('update', updateHandler);

    await render(hbs `
      {{one-way-toggle
        checked=checked
        update=(action update)}}
    `);

    const $oneWayToggle = this.$('.one-way-toggle');

    $('.one-way-toggle').click();

    wait({ waitForTimers: false }).then(() => {
      expect($oneWayToggle, 'disable right after click')
        .to.have.class('disabled');
      expect($oneWayToggle, 'check right after click')
        .to.have.class('checked');
      // should fire after updateHandler resolve
      wait().then(() => {
        expect($oneWayToggle, 'enabled after action resolve')
          .to.not.have.class('disabled');
        expect($oneWayToggle, 'checked after action resolve')
          .to.have.class('checked');
        done();
      });
    });
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

    expect(getToggle(this).find('.one-icon')).to.have.class('oneicon-lock');
  });

  it('has no "lock" icon when is not readonly', async function () {
    await render(hbs `{{one-way-toggle isReadOnly=false}}`);

    expect(getToggle(this).find('.one-icon')).to.not.exist;
  });

  it('has no "lock" icon when is readonly but "showLockForReadOnly" is false', async function () {
    await render(hbs `{{one-way-toggle isReadOnly=true showLockForReadOnly=false}}`);

    expect(getToggle(this).find('.one-icon')).to.not.exist;
  });

  function getToggle(testCase) {
    return testCase.$('.one-way-toggle');
  }
});
