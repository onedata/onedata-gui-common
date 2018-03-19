import Mixin from '@ember/object/mixin';
import { get, computed } from '@ember/object';
import _ from 'lodash';
import generateColors from 'onedata-gui-common/utils/generate-colors';

export default Mixin.create({
  /**
   * @virtual
   * @type {PromiseArray<models/Provider>}
   */
  providersProxy: undefined,

  /**
   * Global colors for each provider
   * @type {Ember.ComputedProperty<Object>}
   */
  providersColors: computed(
    'providersProxy.{content.@each.entityId,isFulfilled}',
    function getProvidersColors() {
      const providersProxy = this.get('providersProxy');
      if (get(providersProxy, 'isFulfilled')) {
        const providerIds = get(providersProxy, 'content').mapBy('entityId').sort();
        const colors = generateColors(providerIds.length);
        return _.zipObject(providerIds, colors);
      }
    }),
});
