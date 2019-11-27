import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { click, fillIn } from 'ember-native-dom-helpers';
import { get, computed } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../helpers/stub-service';

describe('Integration | Component | one sidebar', function () {
  setupComponentTest('one-sidebar', {
    integration: true,
  });

  beforeEach(function () {
    clearLocalStorage();
    this.set('model', {
      resourceType: 'testResource',
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

  afterEach(function () {
    clearLocalStorage();
  });

  it('has class "one-sidebar"', function () {
    this.render(hbs `{{one-sidebar}}`);

    expect(this.$('.one-sidebar')).to.exist;
  });

  it('lists resources passed via model', function () {
    this.render(hbs `{{one-sidebar model=model}}`);

    const $items = this.$('.resource-item');
    expect($items).to.have.length(2);
    expect($items.eq(0).text().trim()).to.equal('res1');
    expect($items.eq(1).text().trim()).to.equal('res2');
  });

  it('allows to filter using search-bar', function () {
    this.render(hbs `{{one-sidebar model=model}}`);

    return fillIn('.search-bar', '1')
      .then(() => {
        const $items = this.$('.resource-item');
        expect($items).to.have.length(1);
        expect($items.text().trim()).to.equal('res1');
      });
  });

  it(
    'does not render "Hide advanced filters" link, when advancedFiltersComponent is not set',
    function () {
      this.render(hbs `{{one-sidebar model=model}}`);

      expect(this.$('.toggle-more-filters')).to.not.exist;
    }
  );

  it(
    'renders "Hide advanced filters" link, when advancedFiltersComponent is set',
    function () {
      this.render(hbs `{{one-sidebar
        model=model
        advancedFiltersComponent="test-component"
      }}`);

      const $moreFilters = this.$('.toggle-more-filters');
      expect($moreFilters).to.exist;
      expect($moreFilters.text().trim()).to.equal('Hide advanced filters');
    }
  );

  it(
    'changes "Hide advanced filters" link to "Show advanced filters" after click',
    function () {
      this.render(hbs `{{one-sidebar
        model=model
        advancedFiltersComponent="test-component"
      }}`);

      return click('.toggle-more-filters')
        .then(() => expect(this.$('.toggle-more-filters').text().trim())
          .to.equal('Show advanced filters')
        );
    }
  );

  it(
    'shows component specified by advancedFiltersComponent on initial render',
    function () {
      this.render(hbs `{{one-sidebar
        model=model
        advancedFiltersComponent="test-component"
      }}`);

      expect(this.$('.advanced-filters-collapse.in .test-component')).to.exist
    }
  );

  it(
    'does not show component specified by advancedFiltersComponent after "Hide advanced filters" click',
    function () {
      this.render(hbs `{{one-sidebar
        model=model
        advancedFiltersComponent="test-component"
      }}`);

      return click('.toggle-more-filters')
        .then(() =>
          expect(this.$('.advanced-filters-collapse.in .test-component')).to.not.exist
        )
    }
  );

  it('passes collection to advancedFiltersComponent component', function () {
    this.render(hbs `{{one-sidebar
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
    this.render(hbs `{{one-sidebar
      model=model
      advancedFiltersComponent="test-component"
      advancedFilters=advancedFilters
    }}`);

    const testComponent = this.$('.test-component')[0].componentInstance;
    get(testComponent, 'onChange')(filters);
    expect(filterChangeSpy).to.be.calledWith('advancedFilters', filters);
  });

  it('passes sidebar context while creating sidebar actions', function () {
    const collection = this.get('model.collection');
    const getButtonsForSpy = sinon.spy(
      lookupService(this, 'sidebar-resources'),
      'getButtonsFor'
    );

    this.render(hbs `{{one-sidebar
      model=model
      filter="1"
    }}`);

    expect(getButtonsForSpy).to.be.calledOnce;
    expect(getButtonsForSpy.lastCall.args[0]).to.equal('testResource');
    const passedContext = getButtonsForSpy.lastCall.args[1];
    expect(passedContext).to.exist;
    expect(get(passedContext, 'collection').toArray())
      .to.deep.equal(collection.list.toArray());
    expect(get(passedContext, 'visibleCollection'))
      .to.deep.equal(collection.list.slice(0, 1));
  });

  it(
    'does not render expanded advanced filters when localstorage has key oneSidebar.areAdvancedFiltersVisible == "false"',
    function () {
      const _localStorage = {
        getItem: sinon.stub()
          .withArgs('oneSidebar.areAdvancedFiltersVisible').returns('false'),
      }
      this.set('_localStorage', _localStorage);

      this.render(hbs `{{one-sidebar
        model=model
        advancedFiltersComponent="test-component"
        _localStorage=_localStorage
      }}`);

      expect(this.$('.advanced-filters-collapse.in .test-component')).to.not.exist;
    }
  );

  [
    null,
    'true',
  ].forEach(value => {
    it(
      `renders expanded advanced filters when localstorage has key oneSidebar.areAdvancedFiltersVisible == ${JSON.stringify(value)}`,
      function () {
        const _localStorage = {
          getItem: sinon.stub()
            .withArgs('oneSidebar.areAdvancedFiltersVisible').returns(value),
        }
        this.set('_localStorage', _localStorage);

        this.render(hbs `{{one-sidebar
          model=model
          advancedFiltersComponent="test-component"
          _localStorage=_localStorage
        }}`);

        expect(this.$('.advanced-filters-collapse.in .test-component')).to.exist;
      }
    );
  });

  it(
    'remembers advanced filters collapse state in localstorage oneSidebar.areAdvancedFiltersVisible key',
    function () {
      const _localStorage = {
        getItem: sinon.stub().returns('true'),
        setItem: sinon.spy(),
      }
      this.set('_localStorage', _localStorage);

      this.render(hbs `{{one-sidebar
        model=model
        advancedFiltersComponent="test-component"
        _localStorage=_localStorage
      }}`);

      return click('.toggle-more-filters')
        .then(() => {
          expect(_localStorage.setItem).to.be.calledOnce;
          expect(_localStorage.setItem)
            .to.be.calledWith('oneSidebar.areAdvancedFiltersVisible', 'false');
          return click('.toggle-more-filters');
        })
        .then(() => {
          expect(_localStorage.setItem).to.be.calledTwice;
          expect(_localStorage.setItem.lastCall)
            .to.be.calledWith('oneSidebar.areAdvancedFiltersVisible', 'true');
        });
    }
  );
});

function clearLocalStorage() {
  localStorage.removeItem('oneSidebar.areAdvancedFiltersVisible');
}
