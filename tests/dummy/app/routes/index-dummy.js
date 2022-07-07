import Route from '@ember/routing/route';
import componentsList from 'dummy/components-list';

export default Route.extend({
  model() {
    return {
      components: componentsList,
    };
  },
});
