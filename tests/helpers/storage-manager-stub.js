import Ember from 'ember';

const {
  A,
  Service,
  ObjectProxy,
  ArrayProxy,
  PromiseProxyMixin,
  RSVP: { Promise },
} = Ember;

const ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);

// TODO this service stub is probably faulty, because there were problems
// using it in manage-cluster-storages-test

export default Service.extend({
  /**
   * Add storages here in tests (key: storage id, value: storage object)
   */
  __storages: {},

  getStorages() {
    return ObjectPromiseProxy.create({
      promise: new Promise(resolve => {
        let storageDetailsList = A();
        for (let storage in this.get('__storages')) {
          storageDetailsList.push(this.getStorageDetails(storage.id));
        }
        resolve(ArrayProxy.create({ content: storageDetailsList }));
      })
    });
  },

  getStorageDetails(id) {
    return ObjectPromiseProxy.create({
      promise: new Promise((resolve) => resolve(this.get('__storages')[id]))
    });
  },
});
