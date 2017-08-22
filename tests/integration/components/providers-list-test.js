import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import { click, fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';

describe('Integration | Component | providers list', function () {
  setupComponentTest('providers-list', {
    integration: true
  });

  beforeEach(function () {
    this.set('providers', [{
        name: 'provider1',
        color: 'red'
      },
      {
        name: 'provider2',
        color: 'green'
      },
      {
        name: 'provider3',
        color: 'yellow'
      },
    ]);
  });

  it('renders list of providers', function () {
    this.render(hbs `{{providers-list providers=providers}}`);

    let list = this.$('.one-collapsible-list');
    expect(list.children()).to.have.length(4);
    let firstItem = $(list.children()[1]);
    expect(firstItem).to.be.visible;
    expect(firstItem).to.contain('provider1');
  });

  it('sets icon colors according to provider object setting', function () {
    this.render(hbs `{{providers-list providers=providers}}`);

    let firstItemIcon =
      this.$('.one-collapsible-list-item:nth-child(2) .one-icon');
    expect(firstItemIcon.attr('style'))
      .to.contain(this.get('providers')[0].color);
  });

  it('triggers provider clicked action', function (done) {
    let providerClickedSpy = sinon.spy();
    this.on('providerClicked', providerClickedSpy);

    this.render(hbs `
      {{providers-list 
        providers=providers
        providerClickAction=(action "providerClicked")}}
    `);
    click('.one-collapsible-list-item:nth-child(2)').then(() => {
      expect(providerClickedSpy).to.be.calledOnce;
      expect(providerClickedSpy).to.be.calledWith(this.get('providers')[0]);
      done();
    });
  });

  it('triggers providers filter state changed action on init', function (done) {
    let providersFilterSpy = sinon.spy();
    this.on('providersFilter', providersFilterSpy);

    this.render(hbs `
      {{providers-list 
        providers=providers
        providersFilterAction=(action "providersFilter")}}
    `);
    wait().then(() => {
      expect(providersFilterSpy).to.be.calledOnce;
      expect(providersFilterSpy).to.be.calledWith(
        sinon.match.array.deepEquals(this.get('providers'))
      );
      done();
    });
  });

  it('triggers providers filter state changed action after query input',
    function (done) {
      let providersFilterSpy = sinon.spy();
      this.on('providersFilter', providersFilterSpy);

      this.render(hbs `
        {{providers-list 
          providers=providers
          providersFilterAction=(action "providersFilter")}}
      `);
      wait().then(() => {
        fillIn('.search-bar', '1').then(() => {
          expect(providersFilterSpy).to.be.calledTwice;
          expect(providersFilterSpy).to.be.calledWith(
            sinon.match.array.deepEquals([this.get('providers')[0]])
          );
          done();
        });
      });
    }
  );

  it('handles with custom provider actions', function (done) {
    let actionSpy = sinon.spy();
    this.set('actions', [{
      text: 'Action',
      action: actionSpy,
      class: 'action-trigger',
    }]);

    this.render(hbs `
      {{providers-list 
        providers=providers
        providerActions=actions}}
    `);
    click('.one-collapsible-list-item:nth-child(2) .provider-menu-toggle').then(() => {
      click('.action-trigger').then(() => {
        expect(actionSpy).to.be.calledOnce;
        expect(actionSpy).to.be.calledWith(this.get('providers')[0]);
        done();
      });
    });
  });
});
