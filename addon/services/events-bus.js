/**
 * A service that provides events-based communication using methods from
 * `Evented` mixin (e.g. `on()`, `off()`, `trigger()`).
 *
 * Code based on https://github.com/blia/ember-cli-events-bus
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import Evented from '@ember/object/evented';

export default Service.extend(Evented);
