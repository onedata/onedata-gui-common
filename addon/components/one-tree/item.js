/**
 * A component used by one-tree. It represents item of a tree. Yields content and 
 * subtree components. Example of usage can be found in one-tree component comments.
 * 
 * Can be used only as a contextual component yielded by one-tree.
 * 
 * @module components/one-tree/item
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/one-tree/item';

import { invokeAction, invoke } from 'ember-invoke-action';

const {
  assert,
  computed,
  computed: {
    oneWay,
  },
  observer,
  inject: {
    service,
  },
  run: {
    next,
  },
  isArray,
} = Ember;

export default Ember.Component.extend({
  layout,
  classNames: ['one-tree-item'],
  classNameBindings: ['_hasSubtree:has-subtree'],

  tagName: 'li',

  eventsBus: service(),

  key: oneWay('elementId'),

  /**
   * Parent subtree key (will be null for root)
   * @type {*}
   */
  _parentKey: null,

  /**
   * If true, item has a subtree
   * @type {boolean}
   */
  _hasSubtree: false,

  /**
   * Property used in _activeSubtreeKeys observer to compare with new 
   * _activeSubtreeKeys value.
   * @type {Array.*}
   */
  _activeSubtreeKeysOld: [],

  _isSubtreeExpanded: computed('_activeSubtreeKeys.[]', 'key', function () {
    let {
      _activeSubtreeKeys,
      key,
    } = this.getProperties('_activeSubtreeKeys', 'key');
    return _activeSubtreeKeys.indexOf(key) > -1;
  }),

  _bulletIcon: computed('_isSubtreeExpanded', '_hasSubtree', function () {
    let {
      _isSubtreeExpanded,
      _hasSubtree
    } = this.getProperties('_isSubtreeExpanded', '_hasSubtree');

    if (_hasSubtree) {
      if (_isSubtreeExpanded) {
        return 'checkbox-minus';
      } else {
        return 'add';
      }
    } else {
      return 'checkbox-empty';
    }
  }),

  _eventsBusShowHandler: computed(function () {
    return (selectedRootKey, subtreeKey, subtreeIsExpanded) => {
      let {
        key,
        _rootKey,
        _areParentsExpanded
      } = this.getProperties('key', '_rootKey', '_areParentsExpanded');

      assert('one-tree-item: Root tree key must be provided.',
        selectedRootKey !== undefined);

      if (!_areParentsExpanded && subtreeIsExpanded !== false) {
        subtreeIsExpanded = true;
      }

      if (_rootKey === selectedRootKey && subtreeKey === key) {
        invoke(this, 'show', key, subtreeIsExpanded);
      }
    };
  }),

  _activeSubtreeKeysObserver: observer('_activeSubtreeKeys.[]', function () {
    let {
      _activeSubtreeKeys,
      _parentKey,
      key,
      collapseRecursively,
      _activeSubtreeKeysOld,
    } = this.getProperties(
      '_activeSubtreeKeys',
      '_parentKey',
      'key',
      'collapseRecursively',
      '_activeSubtreeKeysOld'
    );

    let isParentActive = _activeSubtreeKeys.indexOf(_parentKey) > -1;
    let wasParentActive = _activeSubtreeKeysOld.indexOf(_parentKey) > -1;
    if (collapseRecursively && wasParentActive && !isParentActive) {
      // collapse if parent tree has collapsed
      next(() => invoke(this, 'show', key, false));
    }
    this.set('_activeSubtreeKeysOld', _activeSubtreeKeys);
  }),

  init() {
    this._super(...arguments);

    let {
      eventsBus,
      _eventsBusShowHandler
    } = this.getProperties('eventsBus', '_eventsBusShowHandler');

    eventsBus.on('one-tree:show', _eventsBusShowHandler);
  },

  willDestroyElement() {
    try {
      let {
        eventsBus,
        _eventsBusShowHandler
      } = this.getProperties('eventsBus', '_eventsBusShowHandler');

      eventsBus.off('one-tree:show', _eventsBusShowHandler);
    } finally {
      this._super(...arguments);
    }
  },

  actions: {
    show(subtreeKeys, subtreeIsExpanded) {
      let {
        _isSubtreeExpanded,
        key,
        _hasSubtree
      } = this.getProperties('_isSubtreeExpanded', 'key', '_hasSubtree');

      if (!_hasSubtree) {
        return;
      }

      if (!isArray(subtreeKeys) || typeof subtreeKeys === 'string') {
        subtreeKeys = [subtreeKeys];
      }

      if (subtreeKeys.indexOf(key) === -1) {
        if (subtreeIsExpanded && !_isSubtreeExpanded) {
          subtreeKeys = subtreeKeys.concat(key);
        }
      }
      invokeAction(this, '_showAction', subtreeKeys, subtreeIsExpanded);
    },
    hasTreeNotify(hasSubtree) {
      this.set('_hasSubtree', hasSubtree);
    }
  }
});
