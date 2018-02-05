import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { run } from '@ember/runloop';
import wait from 'ember-test-helpers/wait';
import { Promise } from 'rsvp';
import $ from 'jquery';

describe('Integration | Component | one way toggle', function () {
  setupComponentTest('one-way-toggle', {
    integration: true
  });

  it('renders checked toggle when passed checked value true', function () {
    this.render(hbs `{{one-way-toggle checked=true}}`);

    let $toggle = this.$('.one-way-toggle');
    expect($toggle).to.have.class('checked');
  });

  it('renders unchecked toggle when passed checked value false', function () {
    this.render(hbs `{{one-way-toggle checked=false}}`);

    let $toggle = this.$('.one-way-toggle');
    expect($toggle).to.not.have.class('checked');
  });

  it('renders half-selected toggle when passed checked value 2 and threeState=true',
    function () {
      this.render(hbs `{{one-way-toggle threeState=true checked=2}}`);

      let $toggle = this.$('.one-way-toggle');
      expect($toggle).to.have.class('maybe');
    }
  );

  it('can be checked', function (done) {
    this.set('checked', false);
    let updateHandler = sinon.spy((value) => this.set('checked', value));
    this.on('update', updateHandler);

    this.render(hbs `{{one-way-toggle checked=checked update=(action "update")}}`);

    click('.one-way-toggle').then(() => {
      expect(this.$('.one-way-toggle')).to.have.class('checked');
      expect(updateHandler).to.be.calledOnce;
      expect(updateHandler).to.be.calledWith(true);
      done();
    });
  });

  it('can be unchecked', function (done) {
    this.set('checked', true);
    let updateHandler = sinon.spy((value) => this.set('checked', value));
    this.on('update', updateHandler);

    this.render(hbs `{{one-way-toggle checked=checked update=(action "update")}}`);

    click('.one-way-toggle').then(() => {
      expect(this.$('.one-way-toggle')).to.not.have.class('checked');
      expect(updateHandler).to.be.calledOnce;
      expect(updateHandler).to.be.calledWith(false);
      done();
    });
  });

  it('cannot be semi-checked when threeState=true', function (done) {
    this.set('checked', false);
    let updateHandler = sinon.spy((value) => this.set('checked', value));
    this.on('update', updateHandler);

    this.render(hbs `
      {{one-way-toggle
        checked=checked
        threeState=true
        update=(action "update")}}
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
    function (done) {
      this.set('checked', false);
      let updateHandler = sinon.spy((value) => this.set('checked', value));
      this.on('update', updateHandler);

      this.render(hbs `
        {{one-way-toggle
          checked=checked
          threeState=true
          allowThreeStateToggle=true
          update=(action "update")}}
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
    function (done) {
      this.set('checked', 2);
      let updateHandler = sinon.spy((value) => this.set('checked', value));
      this.on('update', updateHandler);

      this.render(hbs `
        {{one-way-toggle
          checked=checked
          threeState=true
          allowThreeStateToggle=true
          update=(action "update")}}
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
    function (done) {
      this.set('checked', true);
      let updateHandler = sinon.spy((value) => this.set('checked', value));
      this.on('update', updateHandler);

      this.render(hbs `
        {{one-way-toggle
          checked=checked
          threeState=true
          allowThreeStateToggle=true
          update=(action "update")}}
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

  it('disables toggle until update promise is resolved', function (done) {
    this.set('checked', false);
    const updateHandler = (value) => {
      return new Promise(resolve => {
        run.later(() => {
          this.set('checked', value);
          resolve();
        }, 100);
      });
    };

    this.on('update', updateHandler);

    this.render(hbs `
      {{one-way-toggle
        checked=checked
        update=(action "update")}}
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

  it('cannot be toggled when in progress', function (done) {
    this.set('checked', false);
    const updateHandler = (value) => {
      return new Promise(resolve => {
        run.later(() => {
          this.set('checked', value);
          resolve();
        }, 100);
      });
    };

    this.on('update', updateHandler);

    this.render(hbs `
      {{one-way-toggle
        checked=checked
        update=(action "update")}}
    `);

    const $oneWayToggle = this.$('.one-way-toggle');

    $('.one-way-toggle').click();

    run.later(() => {
      $('.one-way-toggle').click();
      run.later(() => {
        expect($oneWayToggle, 'checked after action resolve')
          .to.have.class('checked');
        done();
      }, 200);
    }, 50);
  });

});
