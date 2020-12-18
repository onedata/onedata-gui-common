import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { click, fillIn, waitUntil } from 'ember-native-dom-helpers';
import $ from 'jquery';
import sinon from 'sinon';
import { get } from '@ember/object';
import { selectChoose } from '../../../helpers/ember-power-select';
import setDefaultQueryValuesBuilder from '../../../helpers/set-default-query-values-builder';

describe('Integration | Component | query builder/block adder', function () {
  setupComponentTest('query-builder/block-adder', {
    integration: true,
  });

  setDefaultQueryValuesBuilder();

  it('has class "query-builder-block-adder"', function () {
    this.render(hbs `{{query-builder/block-adder valuesBuilder=valuesBuilder}}`);

    expect(this.$('.query-builder-block-adder')).to.have.length(1);
  });

  it('shows block selector on click', async function () {
    this.render(hbs `{{query-builder/block-adder valuesBuilder=valuesBuilder}}`);
    await click('.query-builder-block-adder');

    expect($('.webui-popover.in')).to.have.length(1);
    expect($('.query-builder-block-selector')).to.exist;
  });

  it('passess through information about selected operator', async function () {
    const addSpy = this.set('addSpy', sinon.spy());

    this.render(hbs `{{query-builder/block-adder
      onBlockAdd=this.addSpy
      valuesBuilder=valuesBuilder
    }}`);
    await click('.query-builder-block-adder');
    await click('.operator-and');

    expect(addSpy).to.be.calledOnce.and.to.be.calledWith(
      sinon.match(obj => get(obj, 'operator') === 'and')
    );
  });

  it('passess through information about new condition', async function () {
    this.set('queryProperties', [{
      key: 'some_key',
      displayedKey: 'some name',
      type: 'string',
    }]);
    const addSpy = this.set('addSpy', sinon.spy());

    this.render(hbs `{{query-builder/block-adder
      queryProperties=queryProperties
      onBlockAdd=this.addSpy
      valuesBuilder=valuesBuilder
    }}`);
    await click('.query-builder-block-adder');
    await selectChoose('.property-selector-container', 'some name');
    await fillIn('.comparator-value', 'hello');
    await click('.accept-condition');

    expect(addSpy).to.be.calledOnce
      .and.to.be.calledWith(
        sinon.match(obj => get(obj, 'isCondition'))
      );
  });

  it('closes block selector when operator has been chosen', async function () {
    this.render(hbs `{{query-builder/block-adder valuesBuilder=valuesBuilder}}`);
    await click('.query-builder-block-adder');
    await click('.operator-and');

    await waitUntil(() => $('.webui-popover.in').length === 0, { timeout: 1000 });
  });

  it('closes block selector when condition has been choosen', async function () {
    this.set('queryProperties', [{
      key: 'some_key',
      displayedKey: 'some name',
      type: 'string',
    }]);

    this.render(hbs `{{query-builder/block-adder
      queryProperties=queryProperties
      valuesBuilder=valuesBuilder
    }}`);
    await click('.query-builder-block-adder');
    await selectChoose('.property-selector-container', 'some name');
    await fillIn('.comparator-value', 'hello');
    await click('.accept-condition');

    await waitUntil(() => $('.webui-popover.in').length === 0, { timeout: 1000 });
  });

  it('can be disabled', async function () {
    this.render(hbs `{{query-builder/block-adder
      disabled=true
      valuesBuilder=valuesBuilder
    }}`);

    expect(this.$('.query-builder-block-adder')).to.have.attr('disabled');
  });
});
