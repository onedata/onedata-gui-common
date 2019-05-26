import { helper } from '@ember/component/helper';

export function matchQuery([label, query] /*, hash*/ ) {
  return !query || new RegExp(query, 'i').test(label);
}

export default helper(matchQuery);
