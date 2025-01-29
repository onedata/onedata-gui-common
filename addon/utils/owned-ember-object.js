/**
 * Extension of EmberObject with OwnerInjector mixin to avoid using extend in multiple
 * classes.
 *
 * This module exports EmberObject extended with OwnerInjector by default but also
 * exports DynamicOwnejInjector extended EmberObject.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OwnerInjector, { DynamicOwnerInjector } from 'onedata-gui-common/mixins/owner-injector';
import EmberObject from '@ember/object';

export class OwnedEmberObject extends EmberObject.extend(OwnerInjector) {}

export class DynamicOwnedEmberObject extends EmberObject.extend(DynamicOwnerInjector) {}

export default OwnedEmberObject;
