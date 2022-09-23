/**
 * Replaces Ember's `HashLocation` class with its fixed version.
 *
 * Extensions added to the `HashLocation`:
 * - overwritten `replaceURL` method so it replaces whole URL instead of only
 *   after-hash part. It is a solution for a bug in Safari, which happens when
 *   all of the following conditions occur:
 *   1. When there is a main application and application nested in iframe.
 *   2. And when URLs between main application and nested one differs
 *      (e.g. different domains).
 *   3. And when nested application calls in parent navigation a transition
 *      with "replace" option.
 *   Then parent application takes (by mistake) a URL part before '#' character
 *   from the nested application and uses it when replacing url.
 *   Example:
 *     Given:
 *       Parent application URL: https://a.com/i#/some/aspect?option=a
 *       Nested application URL: https://b.com/i#/some/other-aspect
 *     When:
 *       Nested application calls in parent navigation a transition
 *       with replace to: `/some/aspect?option=b`
 *     Then:
 *       Parent application URL: https://b.com/i#/some/aspect?option=b
 *       (mixed URLs of both applications - incorrect. Should be
 *       https://a.com/i#/some/aspect?option=b)
 *   It is probably caused by a buggy implementation of
 *   `window.location.replace` in Safari.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import HashLocation from '@ember/routing/hash-location';

const FixedHashLocation = HashLocation.extend({
  replaceURL(path) {
    this.location.replace(`${this.location.origin}${this.location.pathname}#${path}`);
    this.set('lastSetURL', path);
  },
});

export default {
  name: 'hash-location',

  initialize: function (application) {
    application.register('location:hash', FixedHashLocation);
  },
};
