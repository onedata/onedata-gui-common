import { expect } from 'chai';
import { describe, it } from 'mocha';
import FormElement from 'onedata-gui-common/utils/form-component/form-element';
import { get } from '@ember/object';
import sinon from 'sinon';

describe('Unit | Utility | form component/form element', function () {
  it('has an empty fields array', function () {
    const formElement = FormElement.create();

    expect(get(formElement, 'fields')).to.have.length(0);
  });

  it('is enabled by default', function () {
    const formElement = FormElement.create();

    expect(get(formElement, 'isEnabled')).to.be.true;
  });

  it('can be disabled using disable()', function () {
    const formElement = FormElement.create();

    expect(get(formElement, 'isEnabled')).to.be.true;
    formElement.disable();
    expect(get(formElement, 'isEnabled')).to.be.false;
  });

  it('can be enabled using enabled()', function () {
    const formElement = FormElement.create({
      isEnabled: false,
    });

    formElement.disable();
    formElement.enable();

    expect(get(formElement, 'isEnabled')).to.be.true;
  });

  it('is in mode "edit" by default', function () {
    const formElement = FormElement.create();

    expect(get(formElement, 'mode')).to.equal('edit');
  });

  it('allows to change mode using changeMode()', function () {
    const formElement = FormElement.create();

    formElement.changeMode('show');

    expect(get(formElement, 'mode')).to.equal('show');
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

  it('has value calculated from valuesSource and path', function () {
    const formElement = FormElement.create({
      parent: {
        path: 'parent',
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
      path: 'a',
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
});
