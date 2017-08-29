/**
 * @module components/demo-components/providers-list
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

export default Ember.Component.extend({
  // fake providers
  providers: [{
      id: '1',
      name: 'provider1',
      color: '#4BD187',
    },
    {
      id: '2',
      name: 'provider2',
      color: '#3ea5f9',
    },
    {
      id: '3',
      name: 'provider3',
      color: '#EE3F3F',
    }
  ],

  // fake provider actions
  providerActions: [{
      text: 'Action',
      action: () => {},
      class: 'action1-trigger',
    },
    {
      text: 'Another action',
      action: () => {},
      class: 'action2-trigger',
    },
  ],
});
