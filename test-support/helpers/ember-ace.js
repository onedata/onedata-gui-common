import hbs from 'htmlbars-inline-precompile';
import TestComponent from 'onedata-gui-common/components/test-component';

export function replaceEmberAceWithTextarea(context) {
  context.owner.register('component:ember-ace', TestComponent.extend({
    layout: hbs`<textarea
      value={{value}}
      oninput={{action (or update (no-action)) value="target.value"}}
      disabled={{readOnly}}
    ></textarea>`,
  }));
}
