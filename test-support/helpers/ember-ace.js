import { hbs } from 'ember-cli-htmlbars';
import TestComponent from 'onedata-gui-common/components/test-component';

export function replaceEmberAceWithTextarea(context) {
  context.owner.register('component:ember-ace', TestComponent.extend({
    layout: hbs`<textarea value={{value}}></textarea>`,
  }));
}
