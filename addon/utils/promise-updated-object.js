// import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';
import CustomPromiseMixin from 'onedata-gui-common/mixins/ember/custom-promise-proxy';
import ObjectProxy from '@ember/object/proxy';
import { observer } from '@ember/object';
import emberObjectReplace from 'onedata-gui-common/utils/ember-object-replace';

export default ObjectProxy.extend(CustomPromiseMixin, {
  resolvedContentProperty: '_promiseContent',
  _promiseContent: null,

  _updateContent: observer('_promiseContent', function () {
    const {
      _promiseContent,
      content,
    } = this.getProperties('_promiseContent', 'content');
    if (content) {
      emberObjectReplace(content, _promiseContent);
    } else {
      this.set('content', _promiseContent);
    }
  }),
});
