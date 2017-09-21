import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';

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

  it('cannot be changed when isReadOnly=true', function (done) {
    this.set('checked', false);
    let updateHandler = sinon.spy((value) => this.set('checked', value));
    this.on('update', updateHandler);

    this.render(hbs `
      {{one-way-toggle
        checked=checked
        isReadOnly=true
        update=(action "update")}}
    `);

    click('.one-way-toggle').then(() => {
      expect(this.$('.one-way-toggle')).to.not.have.class('checked');
      expect(updateHandler).to.be.notCalled;
      done();
    });
  });
});
