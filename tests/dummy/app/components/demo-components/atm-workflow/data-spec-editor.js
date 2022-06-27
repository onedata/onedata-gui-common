import Component from '@ember/component';
import { computed, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';
import {
  FormElement as DataSpecEditor,
  dataSpecToFormValues,
  formValuesToDataSpec,
} from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/data-spec-editor2';

export default Component.extend({
  rootGroup: computed(function rootGroup() {
    return RootGroup.create({
      component: this,
    });
  }),

  latestUserValue: null,

  formattedLatestUserValue: computed(
    'latestUserValue',
    function formattedLatestUserValue() {
      return JSON.stringify(this.get('latestUserValue'), null, 2);
    }
  ),

  init() {
    this._super(...arguments);
    const rootGroup = this.get('rootGroup');
    set(rootGroup, 'valuesSource', createValuesContainer({
      dataSpec: dataSpecToFormValues(),
    }));
    rootGroup.useCurrentValueAsDefault();
    console.log(rootGroup);
  },
});

const RootGroup = FormFieldsRootGroup.extend({
  ownerSource: reads('component'),
  fields: computed(function fields() {
    return [
      DataSpecEditor.create({ name: 'dataSpec' }),
    ];
  }),
  onValueChange() {
    this._super(...arguments);
    scheduleOnce('afterRender', this, 'logValues');
  },
  logValues() {
    const value = this.dumpValue();
    this.set('component.latestUserValue', formValuesToDataSpec(value.dataSpec));
    console.log(
      'isValid:', this.get('isValid'),
      'isModified:', this.get('isModified'),
      'value:', value
    );
  },
});
