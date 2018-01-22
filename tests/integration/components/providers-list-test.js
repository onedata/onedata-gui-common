import { A } from '@ember/array';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import { click, fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import _ from 'lodash';

describe('Integration | Component | providers list', function () {
  setupComponentTest('providers-list', {
    integration: true
  });

  beforeEach(function () {
    let spaces = A([{
      name: 'space1',
      supportSizes: {
        '1': 2097152,
        '2': 1048576,
        '3': 1048576,
      },
    }, {
      name: 'space2',
      supportSizes: {
        '1': 1048576,
        '2': 2097152,
        '3': 1048576,
      }
    }])
    this.setProperties({
      providersData: A([{
          provider: {
            id: '1',
            name: 'provider1',
            spaces,
          },
          color: 'red'
        },
        {
          provider: {
            id: '2',
            name: 'provider2',
            spaces,
          },
          color: 'green'
        },
        {
          provider: {
            id: '3',
            name: 'provider3',
            spaces,
          },
          color: 'yellow'
        },
      ]),
      selectedSpace: spaces[0],
    });
  });

  it('renders list of providers', function () {
    this.render(hbs `{{providers-list providersData=providersData}}`);

    let list = this.$('.one-collapsible-list');
    expect(list.children()).to.have.length(4);
    let firstItem = $(list.children()[1]);
    expect(firstItem).to.be.visible;
    expect(firstItem).to.contain('provider1');
  });

  it('sets icon colors according to provider object setting', function () {
    this.render(hbs `{{providers-list providersData=providersData}}`);

    let firstItemIcon =
      this.$('.one-collapsible-list-item:nth-child(2) .one-icon');
    expect(firstItemIcon.attr('style'))
      .to.contain(this.get('providersData')[0].color);
  });

  it('triggers provider clicked action', function (done) {
    let providerClickedSpy = sinon.spy();
    this.on('providerClicked', providerClickedSpy);

    this.render(hbs `
      {{providers-list 
        providersData=providersData
        providerClickAction=(action "providerClicked")}}
    `);
    click('.one-collapsible-list-item:nth-child(2)').then(() => {
      expect(providerClickedSpy).to.be.calledOnce;
      expect(providerClickedSpy).to.be.calledWith(this.get('providersData')[0].provider);
      done();
    });
  });

  it('triggers providers filter state changed action on init', function (done) {
    let providersFilterSpy = sinon.spy();
    this.on('providersFilter', providersFilterSpy);

    this.render(hbs `
      {{providers-list 
        providersData=providersData
        providersFilterAction=(action "providersFilter")}}
    `);
    wait().then(() => {
      expect(providersFilterSpy).to.be.calledOnce;
      expect(providersFilterSpy).to.be.calledWith(
        sinon.match.array.deepEquals(
          _.map(this.get('providersData'), 'provider')
        )
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
          providersData=providersData
          providersFilterAction=(action "providersFilter")}}
      `);
      wait().then(() => {
        fillIn('.search-bar', '1').then(() => {
          expect(providersFilterSpy).to.be.calledTwice;
          expect(providersFilterSpy).to.be.calledWith(
            sinon.match.array.deepEquals([this.get('providersData')[0].provider])
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
        providersData=providersData
        providerActions=actions}}
    `);
    click('.one-collapsible-list-item:nth-child(2) .provider-menu-toggle').then(() => {
      click('.action-trigger').then(() => {
        expect(actionSpy).to.be.calledOnce;
        expect(actionSpy).to.be.calledWith(this.get('providersData')[0].provider);
        done();
      });
    });
  });

  it('shows information about supported spaces', function () {
    this.render(hbs `
      {{providers-list 
        providersData=providersData
        selectedSpace=selectedSpace
      }}
    `);
    let firstProviderItem = this.$('.one-collapsible-list-item:nth-child(2)');
    expect(firstProviderItem.find('.supported-spaces')).to.contain('2');
    expect(firstProviderItem.find('.space-support-size')).to.contain('2 MiB');
  });
});
