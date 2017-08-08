import Ember from 'ember';

const {
  A,
  Service,
  ObjectProxy,
  PromiseProxyMixin,
  RSVP: { Promise },
} = Ember;

const ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);

export default Service.extend({
  __spaces: [],

  getSpaces() {
    return ObjectPromiseProxy.create({
      promise: new Promise(resolve => {
        let spaceDetailsList = A();
        for (let space in this.get('__spaces')) {
          spaceDetailsList.push(this.getSpaceDetails(space.id));
        }
        resolve(spaceDetailsList);
      })
    });
  },
  getSpaceDetails(id) {
    return ObjectPromiseProxy.create({
      promise: new Promise((resolve) => resolve(this.get('__spaces')[id]))
    });
  },
});
