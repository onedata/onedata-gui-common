import Component from '@ember/component';
import _ from 'lodash';

export default Component.extend({
  shortText: 'Hello world',
  longText: 'Lorem ipsum sit dolor lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
  textareaFillText: _.repeat('a', 294),
});
