import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  menuItems: computed(() => ([{
      action: () => alert('action1'),
      icon: 'space',
      title: 'Action 1',
    },
    {
      action: () => alert('action2'),
      icon: 'provider',
      title: 'Action 2',
    },
    {
      action: () => alert('action3'),
      icon: 'group',
      title: 'Action 3',
    },
  ])),
});
