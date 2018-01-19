import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { click, fillIn } from 'ember-native-dom-helpers';
import wait from 'ember-test-helpers/wait';
import { Promise } from 'rsvp';
import sinon from 'sinon';

describe('Integration | Component | one inline editor', function () {
  setupComponentTest('one-inline-editor', {
    integration: true,
  });

  it('renders value', function () {
    const value = 'asdf';
    this.set('value', value);
    this.render(hbs `{{one-inline-editor value=value}}`);
    expect(this.$('.one-label').text().trim()).to.equal(value);
  });

  it('shows input with value after text click', function (done) {
    const value = 'asdf';
    this.set('value', value);
    this.render(hbs `{{one-inline-editor value=value}}`);
    click('.one-label').then(() => {
      const input = this.$('input');
      expect(input).to.exist;
      expect(input.val()).to.equal(value);
      done();
    })
  });

  it('allows to cancel edition', function (done) {
    const value = 'asdf';
    this.set('value', value);
    this.render(hbs `{{one-inline-editor value=value}}`);
    click('.one-label').then(() => {
      fillIn('input', 'anotherValue').then(() => {
        click('.cancel-icon').then(() => {
          expect(this.$('.one-label').text().trim()).to.equal(value);
          done();
        });
      });
    })
  });

  it('allows to cancel edition', function (done) {
    const value = 'asdf';
    this.set('value', value);
    this.render(hbs `{{one-inline-editor value=value}}`);
    click('.one-label').then(() => {
      fillIn('input', 'anotherValue').then(() => {
        click('.cancel-icon').then(() => {
          expect(this.$('.one-label').text().trim()).to.equal(value);
          done();
        });
      });
    })
  });

  it('saves edited value', function (done) {
    const value = 'asdf';
    this.set('value', value);
    let promiseResolve;
    const saveSpy = sinon.spy(() =>
      new Promise((resolve) => promiseResolve = resolve));
    this.on('save', saveSpy);
    this.render(hbs `{{one-inline-editor value=value onSave=(action "save")}}`);
    click('.one-label').then(() => {
      const newValue = 'anotherValue';
      fillIn('input', 'anotherValue').then(() => {
        click('.save-icon').then(() => {
          expect(saveSpy).to.be.calledOnce;
          expect(this.$('.spin-spinner-block')).to.exist;
          expect(this.$('input')).to.be.disabled;
          this.set('value', newValue);
          promiseResolve();
          wait().then(() => {
            expect(this.$('.spin-spinner-block')).to.not.exist;
            expect(this.$('.one-label').text().trim()).to.equal(
              newValue);
            done();
          });
        });
      });
    });
  });
});
