import { expect } from 'chai';
import { describe, it } from 'mocha';
import cloneValue from 'onedata-gui-common/utils/form-component/clone-value';
import { createValuesContainer, isValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';
import EmberObject, { get } from '@ember/object';

describe('Unit | Utility | form component/clone value', function () {
  it('clones nested values tree', function () {
    const values = createValuesContainer({
      field1: 'abc',
      field2: { a: 1 },
      field3: EmberObject.create(),
      field4: createValuesContainer({
        field41: 'def',
      }),
      field5: [1],
    });

    const valuesCopy = cloneValue(values);

    expect(isValuesContainer(valuesCopy)).to.be.true;
    expect(valuesCopy).to.not.equal(values);
    expect(get(valuesCopy, 'field1')).to.equal(get(values, 'field1'));
    expect(get(valuesCopy, 'field2')).to.equal(get(values, 'field2'));
    expect(isValuesContainer(get(valuesCopy, 'field2'))).to.be.false;
    expect(get(valuesCopy, 'field3')).to.equal(get(values, 'field3'));
    expect(isValuesContainer(get(valuesCopy, 'field4'))).to.be.true;
    expect(get(valuesCopy, 'field4')).to.not.equal(get(values, 'field4'));
    expect(get(valuesCopy, 'field4.field41')).to.equal(get(values, 'field4.field41'));
    expect(get(valuesCopy, 'field5')).to.equal(get(values, 'field5'));
  });
});
