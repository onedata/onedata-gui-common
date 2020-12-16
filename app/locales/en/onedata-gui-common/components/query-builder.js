import blockSelector from './query-builder/block-selector';
import conditionBlock from './query-builder/condition-block';
import operatorBlock from './query-builder/operator-block';
import conditionComparatorValueEditor from './query-builder/condition-comparator-value-editor';
import dropdownEditor from './query-builder/value-editors/dropdown-editor';

export default {
  blockSelector,
  conditionBlock,
  operatorBlock,
  conditionComparatorValueEditor,
  valueEditors: {
    dropdownEditor,
  },
};
