/**
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { htmlSafe } from '@ember/string';
import { computed } from '@ember/object';

export default Component.extend({
  isLongReason: true,

  reason: computed('isLongReason', function () {
    return this.get('isLongReason') ?
      this.get('longReason') :
      this.get('shortReason');
  }),

  longReason: htmlSafe(
    `
<code>
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.<br>
Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh<br>
elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed<br>
augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class<br>
aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos<br>
himenaeos. Curabitur sodales ligula in libero.

Sed dignissim lacinia nunc.<br>
Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor.<br>
Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas<br>
porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa.<br>
Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus,<br>
ullamcorper vel, tincidunt sed, euismod in, nibh. Quisque volutpat condimentum<br>
velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per<br>
inceptos himenaeos.

Nam nec ante. Sed lacinia, urna non tincidunt mattis,<br>
tortor neque adipiscing diam, a cursus ipsum ante quis turpis. Nulla facilisi.<br>
Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet.<br>
Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna<br>
luctus suscipit. Sed lectus. Integer euismod lacus luctus magna. Quisque cursus,<br>
metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget<br>
diam.

Vestibulum ante ipsum primis in faucibus orci luctus et ultrices<br>
posuere cubilia Curae; Morbi lacinia molestie dui. Praesent blandit dolor. Sed<br>
non quam. In vel mi sit amet augue congue elementum. Morbi in ipsum sit amet<br>
pede facilisis laoreet. Donec lacus nunc, viverra nec, blandit vel, egestas et,<br>
augue. Vestibulum tincidunt malesuada tellus. Ut ultrices ultrices enim.<br>
Curabitur sit amet mauris. Morbi in dui quis est pulvinar ullamcorper. Nulla<br>
facilisi.

Integer lacinia sollicitudin massa. Cras metus. Sed aliquet risus<br>
a tortor. Integer id quam. Morbi mi. Quisque nisl felis, venenatis tristique,<br>
dignissim in, ultrices sit amet, augue. Proin sodales libero eget ante. Nulla<br>
quam. Aenean laoreet. Vestibulum nisi lectus, commodo ac, facilisis ac,<br>
ultricies eu, pede. Ut orci risus, accumsan porttitor, cursus quis, aliquet<br>
eget, justo.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.<br>
Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh<br>
elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed<br>
augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class<br>
aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos<br>
himenaeos. Curabitur sodales ligula in libero.

Sed dignissim lacinia nunc.<br>
Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor.<br>
Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas<br>
porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa.<br>
Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus,<br>
ullamcorper vel, tincidunt sed, euismod in, nibh. Quisque volutpat condimentum<br>
velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per<br>
inceptos himenaeos.

Nam nec ante. Sed lacinia, urna non tincidunt mattis,<br>
tortor neque adipiscing diam, a cursus ipsum ante quis turpis. Nulla facilisi.<br>
Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet.<br>
Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna<br>
luctus suscipit. Sed lectus. Integer euismod lacus luctus magna. Quisque cursus,<br>
metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget<br>
diam.

Vestibulum ante ipsum primis in faucibus orci luctus et ultrices<br>
posuere cubilia Curae; Morbi lacinia molestie dui. Praesent blandit dolor. Sed<br>
non quam. In vel mi sit amet augue congue elementum. Morbi in ipsum sit amet<br>
pede facilisis laoreet. Donec lacus nunc, viverra nec, blandit vel, egestas et,<br>
augue. Vestibulum tincidunt malesuada tellus. Ut ultrices ultrices enim.<br>
Curabitur sit amet mauris. Morbi in dui quis est pulvinar ullamcorper. Nulla<br>
facilisi.

Integer lacinia sollicitudin massa. Cras metus. Sed aliquet risus<br>
a tortor. Integer id quam. Morbi mi. Quisque nisl felis, venenatis tristique,<br>
dignissim in, ultrices sit amet, augue. Proin sodales libero eget ante. Nulla<br>
quam. Aenean laoreet. Vestibulum nisi lectus, commodo ac, facilisis ac,<br>
ultricies eu, pede. Ut orci risus, accumsan porttitor, cursus quis, aliquet<br>
eget, justo.
<code>
  `
  ),

  shortReason: 'It just failed.',

  actions: {
    toggleReasonLength() {
      this.toggleProperty('isLongReason');
    },
  },
});
