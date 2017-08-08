import Ember from 'ember';

export function matchQuery([ label, query ]/*, hash*/) {
  return !query || new RegExp(query, 'i').test(label);
}

export default Ember.Helper.helper(matchQuery);
