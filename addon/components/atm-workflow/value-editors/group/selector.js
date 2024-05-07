/**
 * A group selector component. Allows to trigger selecting groups from some
 * external source (taken from `editorContext`) or providing group ID.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import { Promise } from 'rsvp';
import { or, not } from 'ember-awesome-macros';
import Action from 'onedata-gui-common/utils/action';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-editors/group/selector';

export default Component.extend({
  layout,
  tagName: 'a',
  classNames: ['group-value-editor-selector', 'action-link'],
  classNameBindings: ['isDisabled:disabled:clickable'],

  /**
   * @virtual
   * @type {AtmDataSpec}
   */
  atmDataSpec: undefined,

  /**
   * @virtual
   * @type {AtmValueEditorContext}
   */
  editorContext: undefined,

  /**
   * @virtual
   * @type {(groups: Array<AtmGroups>) => void}
   */
  onGroupsSelected: undefined,

  /**
   * @virtual
   * @type {() => void}
   */
  onIdProvidingStarted: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  isDisabled: false,

  /**
   * @virtual optional
   * @type {boolean}
   */
  allowManyGroups: false,

  /**
   * @type {boolean}
   */
  areActionsOpened: false,

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  selectGroupsAction: computed(
    'allowManyGroups',
    'editorContext.selectGroups',
    function selectGroupsAction() {
      const action = SelectGroupsAction.create({
        ownerSource: this,
        allowManyGroups: this.allowManyGroups,
        selectGroupsFunction: this.editorContext?.selectGroups,
      });
      action.addExecuteHook((result) => {
        const selectedGroups = result.result;
        if (selectedGroups?.length) {
          this.onGroupsSelected(selectedGroups);
        }
      });
      return action;
    }
  ),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  provideGroupIdAction: computed(
    'onIdProvidingStarted',
    function provideGroupIdAction() {
      const action = ProvideGroupIdAction.create({ ownerSource: this });
      action.addExecuteHook(() => {
        this.onIdProvidingStarted();
      });
      return action;
    }
  ),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  actionsArray: collect('selectGroupsAction', 'provideGroupIdAction'),

  isDisabledObserver: observer('isDisabled', function isDisabledObserver() {
    if (this.areActionsOpened) {
      this.set('areActionsOpened', false);
    }
  }),

  /**
   * @override
   */
  click() {
    this._super(...arguments);
    if (this.isDisabled) {
      return;
    }
    this.toggleProperty('areActionsOpened');
  },

  willDestroyElement() {
    try {
      this.cacheFor('actionsArray')?.forEach((action) => action.destroy());
    } finally {
      this._super(...arguments);
    }
  },

  actions: {
    toggleActionsOpen(state) {
      if (this.isDisabled) {
        return;
      }
      this.set('areActionsOpened', state);
    },
  },
});

const SelectGroupsAction = Action.extend({
  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valueEditors.group.selector.actions.selectGroups',

  /**
   * @virtual
   * @type {{ allowManyGroups: boolean, selectGroupsFunction?: (selectorConfig: GroupsSelectorConfig) => void }}
   */
  context: undefined,

  /**
   * @override
   */
  className: 'select-groups-action-trigger',

  /**
   * @override
   */
  icon: 'group',

  /**
   * @type {boolean}
   */
  isPending: false,

  /**
   * @override
   */
  title: computed('allowManyGroups', function title() {
    return this.t(`title.${this.allowManyGroups ? 'multi' : 'single'}`);
  }),

  /**
   * @override
   */
  disabled: or(not('selectGroupsFunction'), 'isPending'),

  /**
   * @override
   */
  tip: computed('selectGroupsFunction', function tip() {
    if (!this.selectGroupsFunction) {
      return this.t('disabledTip');
    }
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  allowManyGroups: reads('context.allowManyGroups'),

  /**
   * @type {((selectorConfig: GroupsSelectorConfig) => void) | undefined}
   */
  selectGroupsFunction: reads('context.selectGroupsFunction'),

  /**
   * @override
   */
  async onExecute() {
    if (!this.selectGroupsFunction) {
      return [];
    }

    try {
      this.set('isPending', true);
      return await new Promise((resolve) => {
        this.selectGroupsFunction({
          allowMany: this.allowManyGroups,
          onSelected: (groups) => resolve(groups),
          onCancelled: () => resolve([]),
        });
      });
    } finally {
      this.set('isPending', false);
    }
  },
});

const ProvideGroupIdAction = Action.extend({
  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valueEditors.group.selector.actions.provideGroupId',

  /**
   * @override
   */
  className: 'provide-group-id-action-trigger',

  /**
   * @override
   */
  icon: 'circle-id',

  /**
   * @override
   */
  onExecute() {},
});
