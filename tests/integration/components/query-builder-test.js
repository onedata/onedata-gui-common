import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click, fillIn, triggerKeyEvent } from 'ember-native-dom-helpers';
import { clickTrigger, selectChoose } from '../../helpers/ember-power-select';
import { get } from '@ember/object';
import sleep from 'onedata-gui-common/utils/sleep';
import $ from 'jquery';
import wait from 'ember-test-helpers/wait';
// import { selectChoose, clickTrigger } from 'ember-power-select/test-support/helpers';
// import RootOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/root-operator-query-block';
// import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
// import Index from 'harvester-gui-plugin-generic/utils/index';

describe('Integration | Component | query builder main component', function () {
  setupComponentTest('query-builder/block-adder', {
    integration: true,
  });

  beforeEach(function () {
    this.set('queryProperties', [{
        key: 'key_hello',
        type: 'string',
      },
      {
        key: 'key_second',
        type: 'number',
      },
    ]);
  });

  it('has class "query-builder', async function () {
    this.render(hbs `{{query-builder}}`);

    expect(this.$('.query-builder'));
  });

  it('calls "onPerformQuery" after submit button press', async function () {
    const submitSpy = this.set('submitSpy', sinon.spy());

    this.render(hbs `{{query-builder
      onPerformQuery=submitSpy
      queryProperties=queryProperties
    }}`);
    await click('.query-builder-block-adder');
    await selectChoose('.property-selector-container', 'key_hello');
    await fillIn('.comparator-value', 'foo');
    expect($('.accept-condition'), 'accept condition button')
      .to.exist.and.not.have.attr('disabled');
    await click('.accept-condition');
    expect($('.submit-query'), 'submit query button')
      .to.exist.and.not.have.attr('disabled');
    await click('.submit-query');

    const queryMatcher = sinon.match(obj => {
      expect(get(obj, 'operator'), 'operator').to.equal('root');
      expect(get(obj, 'operands.length'), 'operands count').to.equal(1);
      expect(get(obj, 'operands.firstObject.isCondition'), 'is condition').to.be.true;
      return true;
    });
    expect(submitSpy).to.be.calledOnce;
    expect(submitSpy).to.be.calledWith(queryMatcher);
  });

  it(
    'does not disable submit button when edited condition has valid value',
    async function () {
      this.render(hbs `{{query-builder queryProperties=queryProperties}}`);
      await click('.query-builder-block-adder');
      await selectChoose('.property-selector-container', 'key_hello');
      await fillIn('.comparator-value', 'abc');
      expect($('.accept-condition'), 'accept condition button')
        .to.exist.and.not.have.attr('disabled');
      await click('.accept-condition');
      await click('.query-builder-condition-block .comparator-value');
      await fillIn('.query-builder-condition-block .comparator-value', 'def');

      expect(this.$('.submit-query')).to.exist.and.to.not.have.attr('disabled');
    }
  );

  it('disables submit button when edited condition has invalid value', async function () {
    this.render(hbs `{{query-builder queryProperties=queryProperties}}`);

    await click('.query-builder-block-adder');
    await selectChoose('.property-selector-container', 'key_hello');
    await fillIn('.comparator-value', 'foo');
    expect(this.$('.submit-query'), 'submit-query')
      .to.exist.and.to.not.have.attr('disabled');
    await click('.accept-condition');
    await click('.query-builder-condition-block .comparator-value');
    await fillIn('.query-builder-condition-block .comparator-value', '');

    expect(this.$('.submit-query'), 'submit-query')
      .to.exist.and.to.have.attr('disabled');
  });

  it(
    'enables submit button when edited condition had invalid value and then the edition was cancelled',
    async function () {
      this.render(hbs `{{query-builder queryProperties=queryProperties}}`);
      await click('.query-builder-block-adder');
      await selectChoose('.property-selector-container', 'key_hello');
      await fillIn('.comparator-value', 'abc');
      await click('.accept-condition');
      await click('.query-builder-condition-block .comparator-value');
      await fillIn('.query-builder-condition-block .comparator-value', '');
      this.$('.comparator-value').trigger({ type: 'keydown', key: 'Escape' });
      await wait();

      expect(this.$('.submit-query'), 'submit query button').to.not.have.attr('disabled');
    }
  );

  it(
    'enables submit button when edited condition had invalid value and then the condition was deleted',
    async function () {
      this.render(hbs `{{query-builder queryProperties=queryProperties}}`);
      await click('.query-builder-block-adder');
      await selectChoose('.property-selector-container', 'key_hello');
      await fillIn('.comparator-value', 'abc');
      await click('.accept-condition');
      await click('.query-builder-condition-block .comparator-value');
      await fillIn('.query-builder-condition-block .comparator-value', '');
      await click('.remove-block');

      expect(this.$('.submit-query')).to.not.have.attr('disabled');
    }
  );

  it(
    'enables submit button when edited condition had invalid value and then the containing operator was deleted',
    async function () {
      this.render(hbs `{{query-builder queryProperties=queryProperties}}`);
      await click('.query-builder-block-adder');
      await click('.operator-not');
      await click('.query-builder-block-adder');
      await selectChoose('.property-selector-container', 'key_hello');
      await fillIn('.comparator-value', 'abc');
      await click('.accept-condition');
      await click('.query-builder-condition-block .comparator-value');
      await fillIn('.query-builder-condition-block .comparator-value', '');
      await click('.not-operator-block > .remove-block');

      expect(this.$('.submit-query')).to.not.have.attr('disabled');
    }
  );
});
