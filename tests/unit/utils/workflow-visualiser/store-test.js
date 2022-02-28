import { expect } from 'chai';
import { describe, it } from 'mocha';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import { get } from '@ember/object';
import sinon from 'sinon';

describe('Unit | Utility | workflow visualiser/store', function () {
  it('has undefined store data properties', function () {
    const store = Store.create();

    [
      'instanceId',
      'name',
      'description',
      'type',
      'dataSpec',
      'defaultInitialContent',
      'requiresInitialContent',
    ].forEach(propName => expect(get(store, propName)).to.be.undefined);
  });

  it('has true "contentMayChange" property by default', function () {
    const store = Store.create();

    expect(get(store, 'contentMayChange')).to.be.true;
  });

  it('calls "onModify" with store reference and modified props on "modify" call', function () {
    const spy = sinon.spy();
    const store = Store.create({
      onModify: spy,
    });
    const modifiedProps = Object.freeze({});

    store.modify(modifiedProps);

    expect(spy).to.be.calledOnce.and.to.be.calledWith(store, modifiedProps);
  });

  it('calls "onRemove" with store reference on "remove" call', function () {
    const spy = sinon.spy();
    const store = Store.create({
      onRemove: spy,
    });

    store.remove();

    expect(spy).to.be.calledOnce.and.to.be.calledWith(store);
  });
});
