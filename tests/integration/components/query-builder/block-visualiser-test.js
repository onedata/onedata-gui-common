import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import AndOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/and-operator-query-block';
import OrOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/or-operator-query-block';
import NotOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/not-operator-query-block';
import ConditionQueryBlock from 'onedata-gui-common/utils/query-builder/condition-query-block';
import setDefaultQueryValuesBuilder from '../../../helpers/set-default-query-values-builder';

const operatorBlockClasses = {
  and: AndOperatorQueryBlock,
  or: OrOperatorQueryBlock,
  not: NotOperatorQueryBlock,
};

describe('Integration | Component | query builder/block visualiser', function () {
  setupComponentTest('query-builder/block-visualiser', {
    integration: true,
  });

  setDefaultQueryValuesBuilder();

  Object.keys(operatorBlockClasses).forEach(operatorName => {
    const upperOperator = operatorName.toUpperCase();
    it(
      `renders ${upperOperator} operator block according to the passed block spec`,
      async function () {
        this.set('queryBlock', operatorBlockClasses[operatorName].create());

        this.render(hbs `{{query-builder/block-visualiser
          queryBlock=queryBlock
          valuesBuilder=valuesBuilder
        }}`);

        expect(
          this.$(`.query-builder-operator-block.${operatorName}-operator-block`),
          'operator block'
        ).to.exist;
      }
    );
  });

  it(
    'renders condition block according to the passed block spec',
    async function () {
      this.set('queryBlock', ConditionQueryBlock.create());

      this.render(hbs `{{query-builder/block-visualiser
        queryBlock=queryBlock
        valuesBuilder=valuesBuilder
      }}`);

      expect(this.$('.query-builder-condition-block')).to.exist;
    }
  );
});
