import Mixin from '@ember/object/mixin';
import QueryValueComponentsBuilder from 'onedata-gui-common/utils/query-value-components-builder';

export default Mixin.create({
  init() {
    this._super(...arguments);
    if (!this.get('valuesBuilder')) {
      this.set('valuesBuilder', QueryValueComponentsBuilder.create());
    }
  },
});
