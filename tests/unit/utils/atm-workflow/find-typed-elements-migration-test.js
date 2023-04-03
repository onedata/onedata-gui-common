import { expect } from 'chai';
import { describe, it } from 'mocha';
import _ from 'lodash';
import findTypedElementsMigration from 'onedata-gui-common/utils/atm-workflow/find-typed-elements-migration';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';

const typedElementsForTests = Object.freeze([{
  name: 'elem1',
  dataSpec: { type: AtmDataSpecType.Number },
}, {
  name: 'elem2',
  dataSpec: { type: AtmDataSpecType.Number },
}, {
  name: 'elem3',
  dataSpec: { type: AtmDataSpecType.Number },
}, {
  name: 'elem4',
  dataSpec: { type: AtmDataSpecType.Number },
}]);

describe('Unit | Utility | atm-workflow/find-typed-elements-migration', function () {
  it('migrates the same elements without changes', async function () {
    const migration = findTypedElementsMigration(
      typedElementsForTests,
      typedElementsForTests,
    );

    expect(migration).to.deep.equal({
      elem1: 'elem1',
      elem2: 'elem2',
      elem3: 'elem3',
      elem4: 'elem4',
    });
  });

  it('migrates to the elements with changed data specs', async function () {
    const typedElementsAfterMigration = _.cloneDeep(typedElementsForTests);
    typedElementsAfterMigration.forEach((spec) =>
      spec.dataSpec.type = AtmDataSpecType.String
    );

    const migration = findTypedElementsMigration(
      typedElementsForTests,
      typedElementsAfterMigration,
    );

    expect(migration).to.deep.equal({
      elem1: 'elem1',
      elem2: 'elem2',
      elem3: 'elem3',
      elem4: 'elem4',
    });
  });

  it('migrates to the elements in changed order', async function () {
    const typedElementsAfterMigration = _.cloneDeep(typedElementsForTests).reverse();

    const migration = findTypedElementsMigration(
      typedElementsForTests,
      typedElementsAfterMigration,
    );

    expect(migration).to.deep.equal({
      elem1: 'elem1',
      elem2: 'elem2',
      elem3: 'elem3',
      elem4: 'elem4',
    });
  });

  it('migrates to the elements with one element renamed', async function () {
    const typedElementsAfterMigration = _.cloneDeep(typedElementsForTests);
    typedElementsAfterMigration[0].name = 'elem1a';
    typedElementsAfterMigration.push(typedElementsAfterMigration.shift());

    const migration = findTypedElementsMigration(
      typedElementsForTests,
      typedElementsAfterMigration,
    );

    expect(migration).to.deep.equal({
      elem1: 'elem1a',
      elem2: 'elem2',
      elem3: 'elem3',
      elem4: 'elem4',
    });
  });

  it('migrates to the elements with one element renamed and one element with the same type added',
    async function () {
      const typedElementsAfterMigration = _.cloneDeep(typedElementsForTests);
      const elemSpecA = typedElementsAfterMigration.shift();
      const elemSpecB = { ...elemSpecA };
      elemSpecA.name = 'elem1a';
      elemSpecB.name = 'elem1b';
      typedElementsAfterMigration.push(elemSpecA, elemSpecB);

      const migration = findTypedElementsMigration(
        typedElementsForTests,
        typedElementsAfterMigration,
      );

      expect(migration).to.deep.equal({
        elem1: null,
        elem2: 'elem2',
        elem3: 'elem3',
        elem4: 'elem4',
      });
    }
  );

  it('migrates to the elements with one element renamed and one element with the same type removed',
    async function () {
      const typedElementsAfterMigration = _.cloneDeep(typedElementsForTests);
      typedElementsAfterMigration[0].name = 'elem1a';
      typedElementsAfterMigration.push(typedElementsAfterMigration.shift());
      typedElementsAfterMigration.shift();

      const migration = findTypedElementsMigration(
        typedElementsForTests,
        typedElementsAfterMigration,
      );

      expect(migration).to.deep.equal({
        elem1: null,
        elem2: null,
        elem3: 'elem3',
        elem4: 'elem4',
      });
    }
  );

  it('migrates to the elements with two elements with the same type renamed',
    async function () {
      const typedElementsAfterMigration = _.cloneDeep(typedElementsForTests);
      const elemSpecA = typedElementsAfterMigration.shift();
      const elemSpecB = typedElementsAfterMigration.shift();
      elemSpecA.name = 'elem1a';
      elemSpecB.name = 'elem1b';
      typedElementsAfterMigration.push(elemSpecA, elemSpecB);

      const migration = findTypedElementsMigration(
        typedElementsForTests,
        typedElementsAfterMigration,
      );

      expect(migration).to.deep.equal({
        elem1: null,
        elem2: null,
        elem3: 'elem3',
        elem4: 'elem4',
      });
    }
  );

  it('migrates values to the elements with two elements with different types renamed',
    async function () {
      const typedElementsBeforeMigration = _.cloneDeep(typedElementsForTests);
      typedElementsBeforeMigration[0].dataSpec.type = AtmDataSpecType.String;
      const typedElementsAfterMigration = _.cloneDeep(typedElementsBeforeMigration);
      const elemSpecA = typedElementsAfterMigration.shift();
      const elemSpecB = typedElementsAfterMigration.shift();
      elemSpecA.name = 'elem1a';
      elemSpecB.name = 'elem1b';
      typedElementsAfterMigration.push(elemSpecA, elemSpecB);

      const migration = findTypedElementsMigration(
        typedElementsBeforeMigration,
        typedElementsAfterMigration,
      );

      expect(migration).to.deep.equal({
        elem1: 'elem1a',
        elem2: 'elem1b',
        elem3: 'elem3',
        elem4: 'elem4',
      });
    }
  );
});
