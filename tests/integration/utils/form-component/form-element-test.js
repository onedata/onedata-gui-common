import { expect } from 'chai';
import { describe, it } from 'mocha';
import FormElement from 'onedata-gui-common/utils/form-component/form-element';
import { get } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import { setupComponentTest } from 'ember-mocha';
import _ from 'lodash';
import EmberObject from '@ember/object';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

const fieldModes = [
  'edit',
  'view',
  'mixed',
];

describe('Integration | Utility | form component/form element', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  it('has an empty fields array', function () {
    const formElement = FormElement.create();

    expect(get(formElement, 'fields')).to.have.length(0);
  });

  it('is enabled by default', function () {
    const formElement = FormElement.create();

    expect(get(formElement, 'isEnabled')).to.be.true;
  });

  it(
    'is effectively enabled when is enabled and parent is not available',
    function () {
      const formElement = FormElement.create({
        isEnabled: true,
      });

      expect(get(formElement, 'isEffectivelyEnabled')).to.be.true;
    }
  );

  it(
    'is not effectively enabled when is not enabled and parent is not available',
    function () {
      const formElement = FormElement.create({
        isEnabled: false,
      });

      expect(get(formElement, 'isEffectivelyEnabled')).to.be.false;
    }
  );

  it(
    'is effectively enabled when is enabled and parent is effectively enabled',
    function () {
      const formElement = FormElement.create({
        isEnabled: true,
        parent: FormElement.create({
          isEnabled: true, // so also isEffectivelyEnabled: true
        }),
      });

      expect(get(formElement, 'isEffectivelyEnabled')).to.be.true;
    }
  );

  it(
    'is not effectively enabled when is enabled and parent is not effectively enabled',
    function () {
      const formElement = FormElement.create({
        isEnabled: true,
        parent: FormElement.create({
          isEnabled: false, // so also isEffectivelyEnabled: false
        }),
      });

      expect(get(formElement, 'isEffectivelyEnabled')).to.be.false;
    }
  );

  it(
    'is not effectively enabled when is not enabled and parent is effectively enabled',
    function () {
      const formElement = FormElement.create({
        isEnabled: false,
        parent: FormElement.create({
          isEnabled: true, // so also isEffectivelyEnabled: true
        }),
      });

      expect(get(formElement, 'isEffectivelyEnabled')).to.be.false;
    }
  );

  it(
    'is not effectively enabled when is not enabled and parent is not effectively enabled',
    function () {
      const formElement = FormElement.create({
        isEnabled: false,
        parent: FormElement.create({
          isEnabled: false, // so also isEffectivelyEnabled
        }),
      });

      expect(get(formElement, 'isEffectivelyEnabled')).to.be.false;
    }
  );

  it('is in mode "edit" by default', function () {
    const formElement = FormElement.create();

    expect(get(formElement, 'mode')).to.equal('edit');
  });

  it('allows to change mode using changeMode()', function () {
    const formElement = FormElement.create();

    formElement.changeMode('view');

    expect(get(formElement, 'mode')).to.equal('view');
  });

  fieldModes.forEach(mode => {
    const propName = `isIn${_.upperFirst(mode)}Mode`;
    it(`has true ${propName} when mode is "${mode}" and false all other mode flags`, function () {
      const formElement = FormElement.create();

      formElement.changeMode(mode);

      expect(get(formElement, propName)).to.be.true;
      fieldModes.without(mode).forEach(otherMode =>
        expect(get(formElement, `isIn${_.upperFirst(otherMode)}Mode`)).to.be.false
      );
    });
  });

  it('has isModified set to false by default', function () {
    const formElement = FormElement.create();

    expect(get(formElement, 'isModified')).to.equal(false);
  });

  it('allows to change isModified flag to true using markAsModified()', function () {
    const formElement = FormElement.create();

    formElement.markAsModified();

    expect(get(formElement, 'isModified')).to.equal(true);
  });

  it(
    'allows to change isModified flag to false using markAsNotModified()',
    function () {
      const formElement = FormElement.create();

      formElement.markAsModified();
      formElement.markAsNotModified();

      expect(get(formElement, 'isModified')).to.equal(false);
    }
  );

  it('calculates path using defined parent.path and name', function () {
    const formElement = FormElement.create({
      parent: {
        path: 'parent1',
      },
      name: 'name1',
    });

    expect(get(formElement, 'path')).to.equal('parent1.name1');
  });

  it('calculates path using only name when parent.path is not defined', function () {
    const formElement = FormElement.create({
      name: 'name1',
    });

    expect(get(formElement, 'path')).to.equal('name1');
  });

  it('calculates valuePath using defined parent.valuePath and valueName', function () {
    const formElement = FormElement.create({
      parent: {
        valuePath: 'parent1',
      },
      valueName: 'name1',
    });

    expect(get(formElement, 'valuePath')).to.equal('parent1.name1');
  });

  it('calculates path using only name when parent.path is not defined', function () {
    const formElement = FormElement.create({
      valueName: 'name1',
    });

    expect(get(formElement, 'valuePath')).to.equal('name1');
  });

  it('has value calculated from valuesSource and valuePath', function () {
    const formElement = FormElement.create({
      parent: {
        valuePath: 'parent',
      },
      name: 'field',
      valuesSource: {
        parent: {
          field: 'val',
        },
      },
    });

    expect(get(formElement, 'value')).to.equal('val');
  });

  it('has undefined value when valuesSource is empty', function () {
    const formElement = FormElement.create({
      parentPath: 'parent',
      name: 'field',
    });

    expect(get(formElement, 'value')).to.be.undefined;
  });

  it('has value equal to valuesSource when name is empty', function () {
    const formElement = FormElement.create({
      parentPath: 'parent',
      valuesSource: {
        parent: {
          field: 'val',
        },
      },
    });

    expect(get(formElement, 'value')).to.equal(get(formElement, 'valuesSource'));
  });

  it('notifies about value change', function () {
    const formElement = FormElement.create({
      parent: FormElement.create({
        name: 'parent',
      }),
      name: 'child',
    });
    const onChangeSpy = sinon.spy(get(formElement, 'parent'), 'onValueChange');

    formElement.valueChanged('new');
    expect(onChangeSpy).to.be.calledWith('new', formElement);
  });

  it('notifies about lost focus', function () {
    const formElement = FormElement.create({
      parent: FormElement.create({
        name: 'parent',
      }),
      name: 'child',
    });
    const onFocusLostSpy = sinon.spy(get(formElement, 'parent'), 'onFocusLost');

    formElement.focusLost();
    expect(onFocusLostSpy).to.be.calledWith(formElement);
  });

  it('has isValid equal to true by default', function () {
    const formElement = FormElement.create();

    expect(get(formElement, 'isValid')).to.be.true;
  });

  it('has "invalidFields" equal to empty array by default', function () {
    const formElement = FormElement.create();

    expect(get(formElement, 'invalidFields')).to.be.an('array').that.have.length(0);
  });

  it('returns defaultValue as a dumpDefaultValue() result', function () {
    const formElement = FormElement.create({ defaultValue: 'a' });

    expect(formElement.dumpDefaultValue()).to.equal('a');
  });

  it('notifies about value changed to default value after reset()', function () {
    const formElement = FormElement.create({ defaultValue: 'a' });
    const onChangeSpy = sinon.spy(formElement, 'onValueChange');

    formElement.reset();

    expect(onChangeSpy).to.be.calledWith('a', formElement);
  });

  it('returns value as a dumpValue() result', function () {
    const formElement = FormElement.create({
      valuePath: 'a',
      valuesSource: {
        a: 'b',
      },
    });

    expect(formElement.dumpValue()).to.equal('b');
  });

  it(
    'has truthy "isVisible" by default',
    function () {
      const formElement = FormElement.create();

      expect(get(formElement, 'isVisible')).to.be.true;
    }
  );

  it('calculates label translation using path', function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('some.parent.name.label')
      .returns('labelText');
    const formField = FormElement.create({
      ownerSource: this,
      i18nPrefix: 'some',
      parent: {
        translationPath: 'parent',
      },
      name: 'name',
    });

    expect(get(formField, 'label')).to.equal('labelText');
  });

  it('calculates tip translation using path', function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('some.parent.name.tip')
      .returns('tipText');
    const formField = FormElement.create({
      ownerSource: this,
      i18nPrefix: 'some',
      parent: {
        translationPath: 'parent',
      },
      name: 'name',
    });

    expect(get(formField, 'tip')).to.equal('tipText');
  });

  it(
    'has truthy "addColonToLabel" by default',
    function () {
      const formField = FormElement.create();

      expect(get(formField, 'addColonToLabel')).to.be.true;
    },
  );

  it('has undefined "tooltipClass" by default',
    function () {
      const formField = FormElement.create();

      expect(get(formField, 'tooltipClass')).to.be.undefined;
    },
  );

  it('copies deeply current value to default value after useCurrentValueAsDefault" method call', function () {
    const value = createValuesContainer({
      a: 1,
      b: EmberObject.create(),
    });
    const formElement = FormElement.create({
      name: 'field',
      valuesSource: createValuesContainer({
        field: value,
      }),
    });

    formElement.useCurrentValueAsDefault();

    const defaultValue = formElement.dumpDefaultValue();
    expect(defaultValue).to.not.equal(value);
    expect(defaultValue.a).to.equal(1);
    expect(defaultValue.b).to.equal(value.b);
  });
});
