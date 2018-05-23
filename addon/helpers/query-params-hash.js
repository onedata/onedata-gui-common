import { helper } from '@ember/component/helper';
import { assign } from '@ember/polyfills';

export function queryParamsHash([queryHash]) {
  return {
    values: assign({}, queryHash),
    isQueryParams: true,
  };
}

export default helper(queryParamsHash);
