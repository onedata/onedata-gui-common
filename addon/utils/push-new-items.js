/**
 * Adds new items to array without changing original array reference and
 * reference to items that are deeply equal to these in new array.
 *
 * For detailed description see unit tests that covers all features.
 *
 * @module utils/push-new-items
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';

export default function pushNewItems(orig, update, compare) {
  const isEmberArray = !!orig.pushObject;
  const pushFun = isEmberArray ? 'pushObject' : 'push';

  _.forEach(update, uitem => {
    const matchItemIndex = _.findIndex(orig, oitem => compare(oitem, uitem));
    if (matchItemIndex >= 0) {
      const matchItem = orig[matchItemIndex];
      if (!_.isEqual(matchItem, uitem)) {
        orig[matchItemIndex] = uitem;
        if (isEmberArray) {
          orig.arrayContentDidChange();
        }
      }
    } else {
      orig[pushFun](uitem);
    }
  });
  return orig;
}
