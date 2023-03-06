/**
 * Class similar to `DS.PromiseObject`, but used to create objects that have
 * promise set multiple times (eg. when object is updated multiple times).
 *
 * For usage examples see unit tests.
 *
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

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
