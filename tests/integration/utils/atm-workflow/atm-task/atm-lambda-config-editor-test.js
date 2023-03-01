import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import {
  find,
  findAll,
  fillIn,
  render,
  settled,
} from '@ember/test-helpers';
import _ from 'lodash';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import {
  AtmLambdaConfigEditor,
  rawValueToAtmLambdaConfigEditorValue,
  atmLambdaConfigEditorValueToRawValue,
  migrateAtmLambdaConfigEditorValueToNewSpecs,
} from 'onedata-gui-common/utils/atm-workflow/atm-task';
import OneDropdownHelper from '../../../../helpers/one-dropdown';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';

const allOptionalAndDefaultSpecCombinations = Object.freeze([{
  name: 'param1',
  dataSpec: {
    type: AtmDataSpecType.Number,
  },
  isOptional: false,
  defaultValue: null,
}, {
  name: 'param2',
  dataSpec: {
    type: AtmDataSpecType.Number,
  },
  isOptional: false,
  defaultValue: 1000,
}, {
  name: 'param3',
  dataSpec: {
    type: AtmDataSpecType.Number,
  },
  isOptional: true,
  defaultValue: null,
}, {
  name: 'param4',
  dataSpec: {
    type: AtmDataSpecType.Number,
  },
  isOptional: true,
  defaultValue: 1000,
}]);

const specsForMigrationTests = [...allOptionalAndDefaultSpecCombinations, {
  name: 'param5',
  dataSpec: {
    type: AtmDataSpecType.Number,
  },
  isOptional: false,
  defaultValue: 1000,
}, {
  name: 'param6',
  dataSpec: {
    type: AtmDataSpecType.Number,
  },
  isOptional: true,
  defaultValue: null,
}, {
  name: 'param7',
  dataSpec: {
    type: AtmDataSpecType.Number,
  },
  isOptional: true,
  defaultValue: 1000,
}];

describe('Integration | Utility | atm-workflow/atm-lambda/atm-lambda-config-editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      rootGroup: FormFieldsRootGroup.create({
        ownerSource: this.owner,
        fields: [
          AtmLambdaConfigEditor.create({
            name: 'atmLambdaConfigEditor',
          }),
        ],
      }),
      helper: new Helper(this),
    });
  });

  it('has no parameters defined on init', async function () {
    await this.helper.render();

    expect(this.helper.getParameters()).to.have.length(0);
    expect(this.helper.isValid()).to.be.true;
    expect(this.helper.getValue()).to.deep.equal({});
  });

  it('shows possible value builders for all combinations of optional and default value configurations',
    async function () {
      await this.helper.setValue({}, allOptionalAndDefaultSpecCombinations);

      await this.helper.render();

      expect(this.helper.getFieldLabel('paramValueBuilder'))
        .to.contain.trimmed.text('Value builder');
      expect(await this.helper.getField('paramValueBuilder', 0).getOptionsText())
        .to.deep.equal(['Custom value']);
      expect(await this.helper.getField('paramValueBuilder', 1).getOptionsText())
        .to.deep.equal(['Default value', 'Custom value']);
      expect(await this.helper.getField('paramValueBuilder', 2).getOptionsText())
        .to.deep.equal(['Custom value', 'Leave unassigned']);
      expect(await this.helper.getField('paramValueBuilder', 3).getOptionsText())
        .to.deep.equal(['Default value', 'Custom value']);
    }
  );

  it('shows enabled value editor when value builder is "use custom value"',
    async function () {
      await this.helper.setValue({}, [{
        name: 'param1',
        dataSpec: {
          type: AtmDataSpecType.Number,
        },
        isOptional: false,
      }]);
      await this.helper.render();

      await this.helper.getField('paramValueBuilder')
        .selectOptionByText('Custom value');

      expect(this.helper.getFieldLabel('paramValue'))
        .to.contain.trimmed.text('Value');
      expect(this.helper.getField('paramValue')).to.contain('.number-editor')
        .and.to.contain('input:not([disabled])');
      expect(find('.number-editor input')).to.have.value('0');
      expect(this.helper.isValid()).to.be.true;
      expect(this.helper.getValue()).to.deep.equal({ param1: 0 });
    }
  );

  it('shows value editor with default taken from default value when value builder is "use custom value"',
    async function () {
      await this.helper.setValue({}, [{
        name: 'param1',
        dataSpec: {
          type: AtmDataSpecType.Number,
        },
        isOptional: false,
        defaultValue: 10,
      }]);
      await this.helper.render();

      await this.helper.getField('paramValueBuilder')
        .selectOptionByText('Custom value');

      expect(find('.number-editor input')).to.have.value('10');
      expect(this.helper.isValid()).to.be.true;
      expect(this.helper.getValue()).to.deep.equal({ param1: 10 });
    }
  );

  it('shows disabled value editor when value builder is "use default value"',
    async function () {
      await this.helper.setValue({}, [{
        name: 'param1',
        dataSpec: {
          type: AtmDataSpecType.Number,
        },
        isOptional: false,
        defaultValue: 10,
      }]);
      await this.helper.render();

      await this.helper.getField('paramValueBuilder')
        .selectOptionByText('Default value');

      expect(this.helper.getFieldLabel('paramValue'))
        .to.contain.trimmed.text('Value');
      expect(this.helper.getField('paramValue')).to.contain('.number-editor')
        .and.to.contain('input[disabled]');
      expect(find('.number-editor input')).to.have.value('10');
      expect(this.helper.isValid()).to.be.true;
      expect(this.helper.getValue()).to.deep.equal({});
    }
  );

  it('shows no value editor when value builder is "leave unassigned"', async function () {
    await this.helper.setValue({}, [{
      name: 'param1',
      dataSpec: {
        type: AtmDataSpecType.Number,
      },
      isOptional: true,
    }]);
    await this.helper.render();

    await this.helper.getField('paramValueBuilder')
      .selectOptionByText('Leave unassigned');

    expect(this.helper.getFormGroup('paramValue')).to.not.exist;
    expect(this.helper.isValid()).to.be.true;
    expect(this.helper.getValue()).to.deep.equal({});
  });

  it('propagates invalid state of value editor', async function () {
    await this.helper.setValue({}, [{
      name: 'param1',
      dataSpec: {
        type: AtmDataSpecType.Number,
      },
      isOptional: false,
    }]);
    await this.helper.render();

    await this.helper.getField('paramValueBuilder')
      .selectOptionByText('Custom value');
    await fillIn('input', '');

    expect(this.helper.isValid()).to.be.false;
    expect(this.helper.getValue()).to.deep.equal({ param1: NaN });
  });

  it('remembers value between "use custom value" and "leave unassigned" builders change',
    async function () {
      await this.helper.setValue({}, [{
        name: 'param1',
        dataSpec: {
          type: AtmDataSpecType.Number,
        },
        isOptional: true,
      }]);
      await this.helper.render();

      await this.helper.getField('paramValueBuilder')
        .selectOptionByText('Custom value');
      await fillIn('input', '10');

      expect(this.helper.getValue()).to.deep.equal({ param1: 10 });

      await this.helper.getField('paramValueBuilder')
        .selectOptionByText('Leave unassigned');

      expect(this.helper.getValue()).to.deep.equal({});

      await this.helper.getField('paramValueBuilder')
        .selectOptionByText('Custom value');

      expect(find('input')).to.have.value('10');
      expect(this.helper.getValue()).to.deep.equal({ param1: 10 });
    }
  );

  it('resets value between "use custom value" and "use default value" builders change',
    async function () {
      await this.helper.setValue({}, [{
        name: 'param1',
        dataSpec: {
          type: AtmDataSpecType.Number,
        },
        isOptional: false,
        defaultValue: 2,
      }]);
      await this.helper.render();

      await this.helper.getField('paramValueBuilder')
        .selectOptionByText('Custom value');
      await fillIn('input', '10');

      expect(this.helper.getValue()).to.deep.equal({ param1: 10 });

      await this.helper.getField('paramValueBuilder')
        .selectOptionByText('Default value');

      expect(this.helper.getValue()).to.deep.equal({});
      expect(find('input[disabled]')).to.have.value('2');

      await this.helper.getField('paramValueBuilder')
        .selectOptionByText('Custom value');

      expect(find('input:not([disabled])')).to.have.value('2');
      expect(this.helper.getValue()).to.deep.equal({ param1: 2 });
    }
  );

  it('chooses correct starting builders for empty value and all combinations of optional and default value configurations',
    async function () {
      await this.helper.setValue({}, allOptionalAndDefaultSpecCombinations);

      await this.helper.render();

      expect(this.helper.getField('paramValueBuilder', 0).getSelectedOptionText())
        .to.equal('Custom value');
      expect(this.helper.getField('paramValue', 0).querySelector('input'))
        .to.have.value('0');
      expect(this.helper.getField('paramValueBuilder', 1).getSelectedOptionText())
        .to.equal('Default value');
      expect(this.helper.getField('paramValue', 1).querySelector('input'))
        .to.have.value('1000');
      expect(this.helper.getField('paramValueBuilder', 2).getSelectedOptionText())
        .to.equal('Leave unassigned');
      expect(this.helper.getField('paramValue', 2)).to.not.exist;
      expect(this.helper.getField('paramValueBuilder', 3).getSelectedOptionText())
        .to.equal('Default value');
      expect(this.helper.getField('paramValue', 3).querySelector('input'))
        .to.have.value('1000');
      expect(this.helper.isValid()).to.be.true;
      expect(this.helper.getValue()).to.deep.equal({ param1: 0 });
    }
  );

  it('chooses correct starting builders for non-empty value and all combinations of optional and default value configurations',
    async function () {
      await this.helper.setValue({
        param1: 1,
        param2: 2,
        param3: 3,
        param4: 4,
      }, allOptionalAndDefaultSpecCombinations);

      await this.helper.render();

      for (const i of [0, 1, 2, 3]) {
        expect(this.helper.getField('paramValueBuilder', i).getSelectedOptionText())
          .to.equal('Custom value');
        expect(this.helper.getField('paramValue', i).querySelector('input'))
          .to.have.value(String(i + 1));
      }
      expect(this.helper.isValid()).to.be.true;
      expect(this.helper.getValue()).to.deep.equal({
        param1: 1,
        param2: 2,
        param3: 3,
        param4: 4,
      });
    }
  );

  it('migrates values to the same specs without changes', async function () {
    await this.helper.setValue({
      param1: 1,
      param2: 2,
      param3: 3,
      param4: 4,
    }, specsForMigrationTests);
    await this.helper.render();

    await this.helper.setFormValue(migrateAtmLambdaConfigEditorValueToNewSpecs(
      this.helper.getFormValue(),
      specsForMigrationTests,
    ));

    expectParamFieldsState(this, 'Custom value', '1', 0);
    expectParamFieldsState(this, 'Custom value', '2', 1);
    expectParamFieldsState(this, 'Custom value', '3', 2);
    expectParamFieldsState(this, 'Custom value', '4', 3);
    expectParamFieldsState(this, 'Default value', '1000', 4);
    expectParamFieldsState(this, 'Leave unassigned', null, 5);
    expectParamFieldsState(this, 'Default value', '1000', 6);
    expect(this.helper.isValid()).to.be.true;
    expect(this.helper.getValue()).to.deep.equal({
      param1: 1,
      param2: 2,
      param3: 3,
      param4: 4,
    });
  });

  it('migrates values to the specs with changed data specs', async function () {
    await this.helper.setValue({
      param1: 1,
      param2: 2,
      param3: 3,
      param4: 4,
    }, specsForMigrationTests);
    const specsAfterMigration = _.cloneDeep(specsForMigrationTests);
    specsAfterMigration.forEach((spec) => {
      spec.dataSpec.type = AtmDataSpecType.String;
      if (spec.defaultValue) {
        spec.defaultValue = 'abc';
      }
    });
    await this.helper.render();

    await this.helper.setFormValue(migrateAtmLambdaConfigEditorValueToNewSpecs(
      this.helper.getFormValue(),
      specsAfterMigration,
    ));

    expectParamFieldsState(this, 'Custom value', '', 0);
    expectParamFieldsState(this, 'Default value', 'abc', 1);
    expectParamFieldsState(this, 'Leave unassigned', null, 2);
    expectParamFieldsState(this, 'Default value', 'abc', 3);
    expectParamFieldsState(this, 'Default value', 'abc', 4);
    expectParamFieldsState(this, 'Leave unassigned', null, 5);
    expectParamFieldsState(this, 'Default value', 'abc', 6);
    expect(this.helper.isValid()).to.be.true;
    expect(this.helper.getValue()).to.deep.equal({ param1: '' });
  });

  it('migrates values to the specs in changed order', async function () {
    await this.helper.setValue({
      param1: 1,
      param2: 2,
      param3: 3,
      param4: 4,
    }, specsForMigrationTests);
    const specsAfterMigration = _.cloneDeep(specsForMigrationTests).reverse();
    await this.helper.render();

    await this.helper.setFormValue(migrateAtmLambdaConfigEditorValueToNewSpecs(
      this.helper.getFormValue(),
      specsAfterMigration,
    ));

    expectParamFieldsState(this, 'Default value', '1000', 0);
    expectParamFieldsState(this, 'Leave unassigned', null, 1);
    expectParamFieldsState(this, 'Default value', '1000', 2);
    expectParamFieldsState(this, 'Custom value', '4', 3);
    expectParamFieldsState(this, 'Custom value', '3', 4);
    expectParamFieldsState(this, 'Custom value', '2', 5);
    expectParamFieldsState(this, 'Custom value', '1', 6);
    expect(this.helper.isValid()).to.be.true;
    expect(this.helper.getValue()).to.deep.equal({
      param1: 1,
      param2: 2,
      param3: 3,
      param4: 4,
    });
  });

  it('migrates values to the non-optional specs without default value', async function () {
    await this.helper.setValue({
      param1: 1,
      param2: 2,
      param3: 3,
      param4: 4,
    }, specsForMigrationTests);
    const specsAfterMigration = _.cloneDeep(specsForMigrationTests);
    specsAfterMigration.forEach((spec) => {
      spec.isOptional = false;
      spec.defaultValue = null;
    });
    await this.helper.render();

    await this.helper.setFormValue(migrateAtmLambdaConfigEditorValueToNewSpecs(
      this.helper.getFormValue(),
      specsAfterMigration,
    ));

    expectParamFieldsState(this, 'Custom value', '1', 0);
    expectParamFieldsState(this, 'Custom value', '2', 1);
    expectParamFieldsState(this, 'Custom value', '3', 2);
    expectParamFieldsState(this, 'Custom value', '4', 3);
    expectParamFieldsState(this, 'Custom value', '0', 4);
    expectParamFieldsState(this, 'Custom value', '0', 5);
    expectParamFieldsState(this, 'Custom value', '0', 6);
    expect(this.helper.isValid()).to.be.true;
    expect(this.helper.getValue()).to.deep.equal({
      param1: 1,
      param2: 2,
      param3: 3,
      param4: 4,
      param5: 0,
      param6: 0,
      param7: 0,
    });
  });

  it('migrates values to the non-optional specs with default value', async function () {
    await this.helper.setValue({
      param1: 1,
      param2: 2,
      param3: 3,
      param4: 4,
    }, specsForMigrationTests);
    const specsAfterMigration = _.cloneDeep(specsForMigrationTests);
    specsAfterMigration.forEach((spec) => {
      spec.isOptional = false;
      spec.defaultValue = 1000;
    });
    await this.helper.render();

    await this.helper.setFormValue(migrateAtmLambdaConfigEditorValueToNewSpecs(
      this.helper.getFormValue(),
      specsAfterMigration,
    ));

    expectParamFieldsState(this, 'Custom value', '1', 0);
    expectParamFieldsState(this, 'Custom value', '2', 1);
    expectParamFieldsState(this, 'Custom value', '3', 2);
    expectParamFieldsState(this, 'Custom value', '4', 3);
    expectParamFieldsState(this, 'Default value', '1000', 4);
    expectParamFieldsState(this, 'Default value', '1000', 5);
    expectParamFieldsState(this, 'Default value', '1000', 6);
    expect(this.helper.isValid()).to.be.true;
    expect(this.helper.getValue()).to.deep.equal({
      param1: 1,
      param2: 2,
      param3: 3,
      param4: 4,
    });
  });

  it('migrates values to the optional specs without default value', async function () {
    await this.helper.setValue({
      param1: 1,
      param2: 2,
      param3: 3,
      param4: 4,
    }, specsForMigrationTests);
    const specsAfterMigration = _.cloneDeep(specsForMigrationTests);
    specsAfterMigration.forEach((spec) => {
      spec.isOptional = true;
      spec.defaultValue = null;
    });
    await this.helper.render();

    await this.helper.setFormValue(migrateAtmLambdaConfigEditorValueToNewSpecs(
      this.helper.getFormValue(),
      specsAfterMigration,
    ));

    expectParamFieldsState(this, 'Custom value', '1', 0);
    expectParamFieldsState(this, 'Custom value', '2', 1);
    expectParamFieldsState(this, 'Custom value', '3', 2);
    expectParamFieldsState(this, 'Custom value', '4', 3);
    expectParamFieldsState(this, 'Leave unassigned', null, 4);
    expectParamFieldsState(this, 'Leave unassigned', null, 5);
    expectParamFieldsState(this, 'Leave unassigned', null, 6);
    expect(this.helper.isValid()).to.be.true;
    expect(this.helper.getValue()).to.deep.equal({
      param1: 1,
      param2: 2,
      param3: 3,
      param4: 4,
    });
  });

  it('migrates values to the optional specs with default value', async function () {
    await this.helper.setValue({
      param1: 1,
      param2: 2,
      param3: 3,
      param4: 4,
    }, specsForMigrationTests);
    const specsAfterMigration = _.cloneDeep(specsForMigrationTests);
    specsAfterMigration.forEach((spec) => {
      spec.isOptional = true;
      spec.defaultValue = 1000;
    });
    await this.helper.render();

    await this.helper.setFormValue(migrateAtmLambdaConfigEditorValueToNewSpecs(
      this.helper.getFormValue(),
      specsAfterMigration,
    ));

    expectParamFieldsState(this, 'Custom value', '1', 0);
    expectParamFieldsState(this, 'Custom value', '2', 1);
    expectParamFieldsState(this, 'Custom value', '3', 2);
    expectParamFieldsState(this, 'Custom value', '4', 3);
    expectParamFieldsState(this, 'Default value', '1000', 4);
    expectParamFieldsState(this, 'Default value', '1000', 5);
    expectParamFieldsState(this, 'Default value', '1000', 6);
    expect(this.helper.isValid()).to.be.true;
    expect(this.helper.getValue()).to.deep.equal({
      param1: 1,
      param2: 2,
      param3: 3,
      param4: 4,
    });
  });

  it('migrates values to the specs with one param renamed', async function () {
    await this.helper.setValue({
      param1: 1,
      param2: 2,
      param3: 3,
      param4: 4,
    }, specsForMigrationTests);
    const specsAfterMigration = _.cloneDeep(specsForMigrationTests);
    specsAfterMigration[0].name = 'param1a';
    specsAfterMigration.push(specsAfterMigration.shift());

    await this.helper.render();

    await this.helper.setFormValue(migrateAtmLambdaConfigEditorValueToNewSpecs(
      this.helper.getFormValue(),
      specsAfterMigration,
    ));

    expectParamFieldsState(this, 'Custom value', '2', 0);
    expectParamFieldsState(this, 'Custom value', '3', 1);
    expectParamFieldsState(this, 'Custom value', '4', 2);
    expectParamFieldsState(this, 'Default value', '1000', 3);
    expectParamFieldsState(this, 'Leave unassigned', null, 4);
    expectParamFieldsState(this, 'Default value', '1000', 5);
    expectParamFieldsState(this, 'Custom value', '1', 6);
    expect(this.helper.isValid()).to.be.true;
    expect(this.helper.getValue()).to.deep.equal({
      param2: 2,
      param3: 3,
      param4: 4,
      param1a: 1,
    });
  });

  it('migrates values to the specs with one param renamed and one param with the same type added',
    async function () {
      await this.helper.setValue({
        param1: 1,
        param2: 2,
        param3: 3,
        param4: 4,
      }, specsForMigrationTests);
      const specsAfterMigration = _.cloneDeep(specsForMigrationTests);
      const paramSpecA = specsAfterMigration.shift();
      const paramSpecB = { ...paramSpecA };
      paramSpecA.name = 'param1a';
      paramSpecB.name = 'param1b';
      specsAfterMigration.push(paramSpecA, paramSpecB);

      await this.helper.render();

      await this.helper.setFormValue(migrateAtmLambdaConfigEditorValueToNewSpecs(
        this.helper.getFormValue(),
        specsAfterMigration,
      ));

      expectParamFieldsState(this, 'Custom value', '2', 0);
      expectParamFieldsState(this, 'Custom value', '3', 1);
      expectParamFieldsState(this, 'Custom value', '4', 2);
      expectParamFieldsState(this, 'Default value', '1000', 3);
      expectParamFieldsState(this, 'Leave unassigned', null, 4);
      expectParamFieldsState(this, 'Default value', '1000', 5);
      expectParamFieldsState(this, 'Custom value', '0', 6);
      expectParamFieldsState(this, 'Custom value', '0', 7);
      expect(this.helper.isValid()).to.be.true;
      expect(this.helper.getValue()).to.deep.equal({
        param2: 2,
        param3: 3,
        param4: 4,
        param1a: 0,
        param1b: 0,
      });
    }
  );

  it('migrates values to the specs with one param renamed and one param with the same type removed',
    async function () {
      await this.helper.setValue({
        param1: 1,
        param2: 2,
        param3: 3,
        param4: 4,
      }, specsForMigrationTests);
      const specsAfterMigration = _.cloneDeep(specsForMigrationTests);
      specsAfterMigration[0].name = 'param1a';
      specsAfterMigration.push(specsAfterMigration.shift());
      specsAfterMigration.shift();

      await this.helper.render();

      await this.helper.setFormValue(migrateAtmLambdaConfigEditorValueToNewSpecs(
        this.helper.getFormValue(),
        specsAfterMigration,
      ));

      expectParamFieldsState(this, 'Custom value', '3', 0);
      expectParamFieldsState(this, 'Custom value', '4', 1);
      expectParamFieldsState(this, 'Default value', '1000', 2);
      expectParamFieldsState(this, 'Leave unassigned', null, 3);
      expectParamFieldsState(this, 'Default value', '1000', 4);
      expectParamFieldsState(this, 'Custom value', '0', 5);
      expect(this.helper.isValid()).to.be.true;
      expect(this.helper.getValue()).to.deep.equal({
        param3: 3,
        param4: 4,
        param1a: 0,
      });
    }
  );

  it('migrates values to the specs with two params with the same type renamed',
    async function () {
      await this.helper.setValue({
        param1: 1,
        param2: 2,
        param3: 3,
        param4: 4,
      }, specsForMigrationTests);
      const specsAfterMigration = _.cloneDeep(specsForMigrationTests);
      const paramSpecA = specsAfterMigration.shift();
      const paramSpecB = specsAfterMigration.shift();
      paramSpecA.name = 'param1a';
      paramSpecB.name = 'param1b';
      specsAfterMigration.push(paramSpecA, paramSpecB);

      await this.helper.render();

      await this.helper.setFormValue(migrateAtmLambdaConfigEditorValueToNewSpecs(
        this.helper.getFormValue(),
        specsAfterMigration,
      ));

      expectParamFieldsState(this, 'Custom value', '3', 0);
      expectParamFieldsState(this, 'Custom value', '4', 1);
      expectParamFieldsState(this, 'Default value', '1000', 2);
      expectParamFieldsState(this, 'Leave unassigned', null, 3);
      expectParamFieldsState(this, 'Default value', '1000', 4);
      expectParamFieldsState(this, 'Custom value', '0', 5);
      expectParamFieldsState(this, 'Default value', '1000', 6);
      expect(this.helper.isValid()).to.be.true;
      expect(this.helper.getValue()).to.deep.equal({
        param3: 3,
        param4: 4,
        param1a: 0,
      });
    }
  );

  it('migrates values to the specs with two params with different types renamed',
    async function () {
      const specsBeforeMigration = _.cloneDeep(specsForMigrationTests);
      specsBeforeMigration[0].dataSpec.type = AtmDataSpecType.String;
      await this.helper.setValue({
        param1: 'abc',
        param2: 2,
        param3: 3,
        param4: 4,
      }, specsBeforeMigration);
      const specsAfterMigration = _.cloneDeep(specsBeforeMigration);
      const paramSpecA = specsAfterMigration.shift();
      const paramSpecB = specsAfterMigration.shift();
      paramSpecA.name = 'param1a';
      paramSpecB.name = 'param1b';
      specsAfterMigration.push(paramSpecA, paramSpecB);

      await this.helper.render();

      await this.helper.setFormValue(migrateAtmLambdaConfigEditorValueToNewSpecs(
        this.helper.getFormValue(),
        specsAfterMigration,
      ));

      expectParamFieldsState(this, 'Custom value', '3', 0);
      expectParamFieldsState(this, 'Custom value', '4', 1);
      expectParamFieldsState(this, 'Default value', '1000', 2);
      expectParamFieldsState(this, 'Leave unassigned', null, 3);
      expectParamFieldsState(this, 'Default value', '1000', 4);
      expectParamFieldsState(this, 'Custom value', 'abc', 5);
      expectParamFieldsState(this, 'Custom value', '2', 6);
      expect(this.helper.isValid()).to.be.true;
      expect(this.helper.getValue()).to.deep.equal({
        param3: 3,
        param4: 4,
        param1a: 'abc',
        param1b: 2,
      });
    }
  );
});

function expectParamFieldsState(testCase, paramBuilderText, paramValue, index) {
  expect(testCase.helper.getField('paramValueBuilder', index).getSelectedOptionText())
    .to.equal(paramBuilderText);
  if (paramValue !== null) {
    expect(testCase.helper.getField('paramValue', index).querySelector('input, textarea'))
      .to.have.value(paramValue);
  } else {
    expect(testCase.helper.getField('paramValue', index)).to.not.exist;
  }
}

class Helper {
  constructor(testCase) {
    this.testCase = testCase;
  }

  async render() {
    await render(hbs`{{form-component/field-renderer field=rootGroup}}`);
  }

  getParameters() {
    return findAll('.configMapping-field');
  }

  getFormGroup(name, entryIdx = 0) {
    const parameter = this.getParameters()[entryIdx];
    return parameter?.querySelector(`.${name}-field`);
  }

  getField(name, entryIdx = 0) {
    const fieldSelector = name === 'paramValue' ?
      '.value-editor' : '.dropdown-field-trigger';
    const fieldElement = this.getFormGroup(name, entryIdx)?.querySelector(fieldSelector);
    if (fieldElement && name === 'paramValueBuilder') {
      return new OneDropdownHelper(fieldElement);
    } else {
      return fieldElement;
    }
  }

  getFieldLabel(name, entryIdx = 0) {
    return this.getFormGroup(name, entryIdx)?.querySelector('.control-label');
  }

  isValid() {
    return this.testCase.rootGroup.isValid;
  }

  getValue() {
    return atmLambdaConfigEditorValueToRawValue(this.getFormValue());
  }

  getFormValue() {
    return this.testCase.rootGroup.dumpValue().atmLambdaConfigEditor;
  }

  async setValue(value, configParameterSpecs) {
    await this.setFormValue(
      rawValueToAtmLambdaConfigEditorValue(value, configParameterSpecs)
    );
  }

  async setFormValue(value) {
    this.testCase.set('rootGroup.valuesSource.atmLambdaConfigEditor', value);
    await settled();
  }
}
