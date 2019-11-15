import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { click, fillIn } from 'ember-native-dom-helpers';
import { get, computed } from '@ember/object';
import sinon from 'sinon';

describe('Integration | Component | two level sidebar', function () {
  setupComponentTest('two-level-sidebar', {
    integration: true,
  });

  beforeEach(function () {
    this.set('model', {
      collection: {
        list: [{
          id: 'id1',
          name: 'res1',
        }, {
          id: 'id2',
          name: 'res2',
        }],
      },
    });
  });

  it('has class "two-level-sidebar"', function () {
    this.render(hbs `{{two-level-sidebar}}`);

    expect(this.$('.two-level-sidebar')).to.exist;
  });

  it('lists resources passed via model', function () {
    this.render(hbs `{{two-level-sidebar model=model}}`);

    const $items = this.$('.resource-item');
    expect($items).to.have.length(2);
    expect($items.eq(0).text().trim()).to.equal('res1');
    expect($items.eq(1).text().trim()).to.equal('res2');
  });

  it('allows to filter using search-bar', function () {
    this.render(hbs `{{two-level-sidebar model=model}}`);

    return fillIn('.search-bar', '1')
      .then(() => {
        const $items = this.$('.resource-item');
        expect($items).to.have.length(1);
        expect($items.text().trim()).to.equal('res1');
      });
  });

  it(
    'does not render "Show more filters" link, when advancedFiltersComponent is not set',
    function () {
      this.render(hbs `{{two-level-sidebar model=model}}`);

      expect(this.$('.toggle-more-filters')).to.not.exist;
    }
  );

  it(
    'renders "Show more filters" link, when advancedFiltersComponent is set',
    function () {
      this.render(hbs `{{two-level-sidebar
        model=model
        advancedFiltersComponent="test-component"
      }}`);

      const $moreFilters = this.$('.toggle-more-filters');
      expect($moreFilters).to.exist;
      expect($moreFilters.text().trim()).to.equal('Show more filters');
    }
  );

  it(
    'changes "Show more filters" link to "Hide more filters" after click',
    function () {
      this.render(hbs `{{two-level-sidebar
        model=model
        advancedFiltersComponent="test-component"
      }}`);

      return click('.toggle-more-filters')
        .then(() => expect(this.$('.toggle-more-filters').text().trim())
          .to.equal('Hide more filters')
        );
    }
  );

  it(
    'shows component specified by advancedFiltersComponent on "Show more filters" click',
    function () {
      this.render(hbs `{{two-level-sidebar
        model=model
        advancedFiltersComponent="test-component"
      }}`);

      return click('.toggle-more-filters')
        .then(() =>
          expect(this.$('.advanced-filters-collapse.in .test-component')).to.exist
        );
    }
  );

  it(
    'does not show component specified by advancedFiltersComponent before "Show more filters" click',
    function () {
      this.render(hbs `{{two-level-sidebar
        model=model
        advancedFiltersComponent="one-icon"
      }}`);

      expect(this.$('.advanced-filters-collapse.in .test-component')).to.not.exist;
    }
  );

  it('passes collection to advancedFiltersComponent component', function () {
    this.render(hbs `{{two-level-sidebar
      model=model
      advancedFiltersComponent="test-component"
    }}`);

    const testComponent = this.$('.test-component')[0].componentInstance;
    expect(get(testComponent, 'collection')).to.have.length(2);
  });

  it('saves changed advanced filters into advancedFilters property', function () {
    const filterChangeSpy = sinon.spy();
    const advancedFilters = computed({
      get() {
        return undefined;
      },
      set: filterChangeSpy,
    });
    this.set('advancedFilters', advancedFilters);
    const filters = { filter: 'a' };
    this.render(hbs `{{two-level-sidebar
      model=model
      advancedFiltersComponent="test-component"
      advancedFilters=advancedFilters
    }}`);

    const testComponent = this.$('.test-component')[0].componentInstance;
    get(testComponent, 'onChange')(filters);
    expect(filterChangeSpy).to.be.calledWith('advancedFilters', filters);
  });
});
