/**
 * Get RouteInfo of target route for given path.
 * Eg. handling target transition in 'onedata.sidebar.content.aspect' you can get info
 * of 'onedata.sidebar' path.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @param {Ember.Transition} transition
 * @returns {Ember.RouteInfo}
 */
export default function findRouteInfo(transition, path) {
  return transition.to.find(routeInfo => routeInfo.name === path);
}
