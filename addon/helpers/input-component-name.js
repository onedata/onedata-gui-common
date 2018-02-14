import { helper } from '@ember/component/helper';

export function inputComponentName([type] /*, hash*/ ) {
  switch (type) {
    // fix for Firefox issue: empty value, when an input has illegal characters
    case 'text':
      // falls through
    case 'number':
      return 'one-way-input';
    default:
      return 'one-way-' + type;
  }
}

export default helper(inputComponentName);
