import { expect } from 'chai';
import {
  describe,
  it,
  beforeEach,
  afterEach,
} from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import {
  render,
  click,
  fillIn,
  find,
  findAll,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { get } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../helpers/stub-service';
import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import globals from 'onedata-gui-common/utils/globals';

const TestableOneSidebar = OneSidebar.extend({
  didInsertElement() {
    this._super(...arguments);
    this.get('element').componentInstance = this;
  },
});

describe('Integration | Component | one-sidebar', function () {
  setupRenderingTest();

  beforeEach(function () {
    clearLocalStorage();
    this.owner.register('component:one-sidebar', TestableOneSidebar);
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

  it('has class "one-sidebar"', async function () {
    await render(hbs `{{one-sidebar}}`);

    expect(find('.one-sidebar')).to.exist;
  });

  it('lists resources passed via model', async function () {
    await render(hbs `{{one-sidebar model=model}}`);

    const items = findAll('.resource-item');
    expect(items).to.have.length(2);
    expect(items[0].textContent.trim()).to.equal('res1');
    expect(items[1].textContent.trim()).to.equal('res2');
  });

  it('allows to filter using search-bar', async function () {
    await render(hbs `{{one-sidebar model=model}}`);

    return fillIn('.search-bar', '1')
      .then(() => {
        const items = findAll('.resource-item');
        expect(items).to.have.length(1);
        expect(items[0].textContent.trim()).to.equal('res1');
      });
  });

  it(
    'does not render "Hide advanced filters" link, when advancedFiltersComponent is not set',
    async function () {
      await render(hbs `{{one-sidebar model=model}}`);

      expect(find('.toggle-more-filters')).to.not.exist;
    }
  );

  it(
    'renders "Hide advanced filters" link, when advancedFiltersComponent is set',
    async function () {
      await render(hbs `{{one-sidebar
        model=model
        advancedFiltersComponent="test-component"
      }}`);

      const moreFilters = find('.toggle-more-filters');
      expect(moreFilters).to.exist;
      expect(moreFilters.textContent.trim()).to.equal('Hide advanced filters');
    }
  );

  it(
    'changes "Hide advanced filters" link to "Show advanced filters" after click',
    async function () {
      await render(hbs `{{one-sidebar
        model=model
        advancedFiltersComponent="test-component"
      }}`);

      return click('.toggle-more-filters')
        .then(() => expect(find('.toggle-more-filters').textContent.trim())
          .to.equal('Show advanced filters')
        );
    }
  );

  it(
    'shows component specified by advancedFiltersComponent on initial render',
    async function () {
      await render(hbs `{{one-sidebar
        model=model
        advancedFiltersComponent="test-component"
      }}`);

      expect(find('.advanced-filters-collapse.in .test-component')).to.exist;
    }
  );

  it(
    'does not show component specified by advancedFiltersComponent after "Hide advanced filters" click',
    async function () {
      await render(hbs `{{one-sidebar
        model=model
        advancedFiltersComponent="test-component"
      }}`);

      return click('.toggle-more-filters')
        .then(() =>
          expect(find('.advanced-filters-collapse.in .test-component')).to.not.exist
        );
    }
  );

  it('passes collection to advancedFiltersComponent component', async function () {
    await render(hbs `{{one-sidebar
      model=model
      advancedFiltersComponent="test-component"
    }}`);

    const testComponent = find('.test-component').componentInstance;
    expect(get(testComponent, 'collection')).to.have.length(2);
  });

  it('saves changed advanced filters into advancedFilters property', async function () {
    const filters = { filter: 'a' };
    await render(hbs `{{one-sidebar
      model=model
      advancedFiltersComponent="test-component"
    }}`);

    const testComponent = find('.test-component').componentInstance;
    get(testComponent, 'onChange')(filters);
    expect(get(find('.one-sidebar').componentInstance, 'advancedFilters'))
      .to.equal(filters);
  });

  it('passes sidebar context while creating sidebar actions', async function () {
    const collection = this.get('model.collection');
    const getButtonsForSpy = sinon.spy(
      lookupService(this, 'sidebar-resources'),
      'getButtonsFor'
    );

    await render(hbs `{{one-sidebar
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
    async function () {
      globals.mock('localStorage', {
        getItem: sinon.stub()
          .withArgs('oneSidebar.areAdvancedFiltersVisible').returns('false'),
      });

      await render(hbs `{{one-sidebar
        model=model
        advancedFiltersComponent="test-component"
      }}`);

      expect(find('.advanced-filters-collapse.in .test-component')).to.not.exist;
    }
  );

  [
    null,
    'true',
  ].forEach(value => {
    it(
      `renders expanded advanced filters when localstorage has key oneSidebar.areAdvancedFiltersVisible == ${JSON.stringify(value)}`,
      async function () {
        globals.mock('localStorage', {
          getItem: sinon.stub()
            .withArgs('oneSidebar.areAdvancedFiltersVisible').returns(value),
        });

        await render(hbs `{{one-sidebar
          model=model
          advancedFiltersComponent="test-component"
        }}`);

        expect(find('.advanced-filters-collapse.in .test-component')).to.exist;
      }
    );
  });

  it(
    'remembers advanced filters collapse state in localstorage oneSidebar.areAdvancedFiltersVisible key',
    async function () {
      globals.mock('localStorage', {
        getItem: sinon.stub().returns('true'),
        setItem: sinon.spy(),
      });

      await render(hbs `{{one-sidebar
        model=model
        advancedFiltersComponent="test-component"
      }}`);

      return click('.toggle-more-filters')
        .then(() => {
          expect(globals.localStorage.setItem).to.be.calledOnce;
          expect(globals.localStorage.setItem)
            .to.be.calledWith('oneSidebar.areAdvancedFiltersVisible', 'false');
          return click('.toggle-more-filters');
        })
        .then(() => {
          expect(globals.localStorage.setItem).to.be.calledTwice;
          expect(globals.localStorage.setItem.lastCall)
            .to.be.calledWith('oneSidebar.areAdvancedFiltersVisible', 'true');
        });
    }
  );
});

function clearLocalStorage() {
  globals.localStorage.removeItem('oneSidebar.areAdvancedFiltersVisible');
}
