import { expect } from 'chai';
import { describe, it } from 'mocha';
import FormElement from 'onedata-gui-common/utils/form-component/form-element';
import { get } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import { setupTest } from 'ember-mocha';
import _ from 'lodash';
import EmberObject from '@ember/object';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

const fieldModes = [
  'edit',
  'view',
  'mixed',
];

describe('Integration | Utility | form-component/form-element', function () {
  const { afterEach } = setupTest();

  afterEach(function () {
    this.formElement.destroy();
    this.formElement.parent?.destroy?.();
  });

  it('has an empty fields array', function () {
    this.formElement = FormElement.create();

    expect(get(this.formElement, 'fields')).to.have.length(0);
  });

  it('is enabled by default', function () {
    this.formElement = FormElement.create();

    expect(get(this.formElement, 'isEnabled')).to.be.true;
  });

  it(
    'is effectively enabled when is enabled and parent is not available',
    function () {
      this.formElement = FormElement.create({
        isEnabled: true,
      });

      expect(get(this.formElement, 'isEffectivelyEnabled')).to.be.true;
    }
  );

  it(
    'is not effectively enabled when is not enabled and parent is not available',
    function () {
      this.formElement = FormElement.create({
        isEnabled: false,
      });

      expect(get(this.formElement, 'isEffectivelyEnabled')).to.be.false;
    }
  );

  it(
    'is effectively enabled when is enabled and parent is effectively enabled',
    function () {
      this.formElement = FormElement.create({
        isEnabled: true,
        parent: FormElement.create({
          isEnabled: true, // so also isEffectivelyEnabled: true
        }),
      });

      expect(get(this.formElement, 'isEffectivelyEnabled')).to.be.true;
    }
  );

  it(
    'is not effectively enabled when is enabled and parent is not effectively enabled',
    function () {
      this.formElement = FormElement.create({
        isEnabled: true,
        parent: FormElement.create({
          isEnabled: false, // so also isEffectivelyEnabled: false
        }),
      });

      expect(get(this.formElement, 'isEffectivelyEnabled')).to.be.false;
    }
  );

  it(
    'is not effectively enabled when is not enabled and parent is effectively enabled',
    function () {
      this.formElement = FormElement.create({
        isEnabled: false,
        parent: FormElement.create({
          isEnabled: true, // so also isEffectivelyEnabled: true
        }),
      });

      expect(get(this.formElement, 'isEffectivelyEnabled')).to.be.false;
    }
  );

  it(
    'is not effectively enabled when is not enabled and parent is not effectively enabled',
    function () {
      this.formElement = FormElement.create({
        isEnabled: false,
        parent: FormElement.create({
          isEnabled: false, // so also isEffectivelyEnabled
        }),
      });

      expect(get(this.formElement, 'isEffectivelyEnabled')).to.be.false;
    }
  );

  it('is in mode "edit" by default', function () {
    this.formElement = FormElement.create();

    expect(get(this.formElement, 'mode')).to.equal('edit');
  });

  it('allows to change mode using changeMode()', function () {
    this.formElement = FormElement.create();

    this.formElement.changeMode('view');

    expect(get(this.formElement, 'mode')).to.equal('view');
  });

  fieldModes.forEach(mode => {
    const propName = `isIn${_.upperFirst(mode)}Mode`;
    it(`has true ${propName} when mode is "${mode}" and false all other mode flags`, function () {
      this.formElement = FormElement.create();

      this.formElement.changeMode(mode);

      expect(get(this.formElement, propName)).to.be.true;
      fieldModes.without(mode).forEach(otherMode =>
        expect(get(this.formElement, `isIn${_.upperFirst(otherMode)}Mode`)).to.be.false
      );
    });
  });

  it('has isModified set to false by default', function () {
    this.formElement = FormElement.create();

    expect(get(this.formElement, 'isModified')).to.equal(false);
  });

  it('allows to change isModified flag to true using markAsModified()', function () {
    this.formElement = FormElement.create();

    this.formElement.markAsModified();

    expect(get(this.formElement, 'isModified')).to.equal(true);
  });

  it(
    'allows to change isModified flag to false using markAsNotModified()',
    function () {
      this.formElement = FormElement.create();

      this.formElement.markAsModified();
      this.formElement.markAsNotModified();

      expect(get(this.formElement, 'isModified')).to.equal(false);
    }
  );

  it('calculates path using defined parent.path and name', function () {
    this.formElement = FormElement.create({
      parent: {
        path: 'parent1',
      },
      name: 'name1',
    });

    expect(get(this.formElement, 'path')).to.equal('parent1.name1');
  });

  it('calculates path using only name when parent.path is not defined', function () {
    this.formElement = FormElement.create({
      name: 'name1',
    });

    expect(get(this.formElement, 'path')).to.equal('name1');
  });

  it('calculates valuePath using defined parent.valuePath and valueName', function () {
    this.formElement = FormElement.create({
      parent: {
        valuePath: 'parent1',
      },
      valueName: 'name1',
    });

    expect(get(this.formElement, 'valuePath')).to.equal('parent1.name1');
  });

  it('calculates path using only name when parent.path is not defined', function () {
    this.formElement = FormElement.create({
      valueName: 'name1',
    });

    expect(get(this.formElement, 'valuePath')).to.equal('name1');
  });

  it('has value calculated from valuesSource and valuePath', function () {
    this.formElement = FormElement.create({
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

    expect(get(this.formElement, 'value')).to.equal('val');
  });

  it('has undefined value when valuesSource is empty', function () {
    this.formElement = FormElement.create({
      parentPath: 'parent',
      name: 'field',
    });

    expect(get(this.formElement, 'value')).to.be.undefined;
  });

  it('has value equal to valuesSource when name is empty', function () {
    this.formElement = FormElement.create({
      parentPath: 'parent',
      valuesSource: {
        parent: {
          field: 'val',
        },
      },
    });

    expect(get(this.formElement, 'value')).to.equal(get(this.formElement, 'valuesSource'));
  });

  it('notifies about value change', function () {
    this.formElement = FormElement.create({
      parent: FormElement.create({
        name: 'parent',
      }),
      name: 'child',
    });
    const onChangeSpy = sinon.spy(get(this.formElement, 'parent'), 'onValueChange');

    this.formElement.valueChanged('new');
    expect(onChangeSpy).to.be.calledWith('new', this.formElement);
  });

  it('notifies about lost focus', function () {
    this.formElement = FormElement.create({
      parent: FormElement.create({
        name: 'parent',
      }),
      name: 'child',
    });
    const onFocusLostSpy = sinon.spy(get(this.formElement, 'parent'), 'onFocusLost');

    this.formElement.focusLost();
    expect(onFocusLostSpy).to.be.calledWith(this.formElement);
  });

  it('has isValid equal to true by default', function () {
    this.formElement = FormElement.create();

    expect(get(this.formElement, 'isValid')).to.be.true;
  });

  it('has "invalidFields" equal to empty array by default', function () {
    this.formElement = FormElement.create();

    expect(get(this.formElement, 'invalidFields')).to.be.an('array').that.have.length(0);
  });

  it('returns defaultValue as a dumpDefaultValue() result', function () {
    this.formElement = FormElement.create({ defaultValue: 'a' });

    expect(this.formElement.dumpDefaultValue()).to.equal('a');
  });

  it('notifies about value changed to default value after reset()', function () {
    this.formElement = FormElement.create({ defaultValue: 'a' });
    const onChangeSpy = sinon.spy(this.formElement, 'onValueChange');

    this.formElement.reset();

    expect(onChangeSpy).to.be.calledWith('a', this.formElement);
  });

  it('returns value as a dumpValue() result', function () {
    this.formElement = FormElement.create({
      name: 'a',
      valuesSource: {
        a: 'b',
      },
    });

    expect(this.formElement.dumpValue()).to.equal('b');
  });

  it(
    'has truthy "isVisible" by default',
    function () {
      this.formElement = FormElement.create();

      expect(get(this.formElement, 'isVisible')).to.be.true;
    }
  );

  it('calculates label translation using path', function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('some.parent.name.label')
      .returns('labelText');
    this.formElement = FormElement.create({
      ownerSource: this.owner,
      i18nPrefix: 'some',
      parent: {
        translationPath: 'parent',
      },
      name: 'name',
    });

    expect(get(this.formElement, 'label')).to.equal('labelText');
  });

  it('calculates tip translation using path', function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('some.parent.name.tip')
      .returns('tipText');
    this.formElement = FormElement.create({
      ownerSource: this.owner,
      i18nPrefix: 'some',
      parent: {
        translationPath: 'parent',
      },
      name: 'name',
    });

    expect(get(this.formElement, 'tip')).to.equal('tipText');
  });

  it(
    'has truthy "addColonToLabel" by default',
    function () {
      this.formElement = FormElement.create();

      expect(get(this.formElement, 'addColonToLabel')).to.be.true;
    },
  );

  it('has "size" equal "md" by default when has no parent', function () {
    this.formElement = FormElement.create();

    expect(get(this.formElement, 'size')).to.equal('md');
  });

  it('has the same "size" as its parent', function () {
    this.formElement = FormElement.create({
      parent: FormElement.create({
        size: 'sm',
      }),
    });

    expect(get(this.formElement, 'size')).to.equal('sm');
  });

  it('has undefined "tooltipClass" by default',
    function () {
      this.formElement = FormElement.create();

      expect(get(this.formElement, 'tooltipClass')).to.be.undefined;
    },
  );

  it('copies deeply current value to default value after useCurrentValueAsDefault" method call', function () {
    const value = createValuesContainer({
      a: 1,
      b: EmberObject.create(),
    });
    this.formElement = FormElement.create({
      name: 'field',
      valuesSource: createValuesContainer({
        field: value,
      }),
    });

    this.formElement.useCurrentValueAsDefault();

    const defaultValue = this.formElement.dumpDefaultValue();
    expect(defaultValue).to.not.equal(value);
    expect(defaultValue.a).to.equal(1);
    expect(defaultValue.b).to.equal(value.b);
  });
});
