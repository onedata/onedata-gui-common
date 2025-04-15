/**
 * Provides data for sidebar-loading template: SidebarModelLoader object that is typically
 * created in the model hook of Sidebar route.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Controller from '@ember/controller';

export default class SidebarLoadingController extends Controller {
  /**
   * @virtual
   * @type {SidebarModelLoader}
   */
  sidebarModelLoader;
}
