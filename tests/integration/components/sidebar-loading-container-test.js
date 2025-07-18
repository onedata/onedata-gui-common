import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { find } from '@ember/test-helpers';
import SidebarModelLoader from 'onedata-gui-common/utils/sidebar-model-loader';
import ProgressTracker from 'onedata-gui-common/utils/progress-tracker';
import { Promise } from 'rsvp';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';

describe('Integration | Component | sidebar-loading-container', function () {
  setupRenderingTest();

  it('renders spinner when sidebar model is not resolved yet', async function () {
    const helper = new Helper(this);
    const sidebarCollectionPromise = new Promise(() => {});
    helper.sidebarModelLoader = new SidebarModelLoader(
      'spaces',
      sidebarCollectionPromise
    );

    // when
    await helper.render();

    // then
    expect(helper.spinnerBlock).to.exist;
  });

  it('renders text with name of collection, total number of items and percentage progress',
    async function () {
      const helper = new Helper(this);
      const progressTracker = new ProgressTracker(1000);
      progressTracker.doneCount = 250;
      const sidebarCollectionPromise = new Promise(() => {});
      helper.sidebarModelLoader = new SidebarModelLoader(
        'spaces',
        sidebarCollectionPromise
      );
      helper.sidebarModelLoader.progressTracker = progressTracker;

      // when
      await helper.render();

      // then
      const spinnerLabel = helper.spinnerLabel;
      expect(spinnerLabel).to.include('Loading 1000 spaces...');
      expect(spinnerLabel).to.include('25%');
    }
  );

  it('renders percentage progress as floor integer',
    async function () {
      const helper = new Helper(this);
      const progressTracker = new ProgressTracker(600);
      const sidebarCollectionPromise = new Promise(() => {});
      helper.sidebarModelLoader = new SidebarModelLoader(
        'spaces',
        sidebarCollectionPromise
      );
      helper.sidebarModelLoader.progressTracker = progressTracker;

      // when
      progressTracker.doneCount = 100;
      await helper.render();

      // then
      expect(helper.spinnerLabel).to.include('16%');
    }
  );

  it('renders percentage progress updates',
    async function () {
      const helper = new Helper(this);
      const progressTracker = new ProgressTracker(1000);
      const sidebarCollectionPromise = new Promise(() => {});
      helper.sidebarModelLoader = new SidebarModelLoader(
        'spaces',
        sidebarCollectionPromise
      );
      helper.sidebarModelLoader.progressTracker = progressTracker;

      // when-then (25%)
      progressTracker.doneCount = 250;
      await helper.render();
      expect(helper.spinnerLabel).to.include('25%');

      // when-then (50%)
      progressTracker.doneCount = 500;
      await waitForRender();
      expect(helper.spinnerLabel).to.include('50%');
    }
  );

  it('renders infinite spinner and text without percentage if SidebarLoader is not provided',
    async function () {
      const helper = new Helper(this);

      // when
      await helper.render();

      // then
      expect(helper.spinnerLabel).to.be.empty;
    }
  );

  it('renders regular text for shares without total count available',
    async function () {
      const helper = new Helper(this);
      const sidebarCollectionPromise = new Promise(() => {});
      helper.sidebarModelLoader = new SidebarModelLoader(
        'shares',
        sidebarCollectionPromise
      );

      // when
      await helper.render();

      // then
      const spinnerLabel = helper.spinnerLabel;
      expect(spinnerLabel).to.match(/Loading shares\.\.\./);
    }
  );

  it('renders special text for shares when total count is available',
    async function () {
      const helper = new Helper(this);
      const progressTracker = new ProgressTracker(1000);
      progressTracker.doneCount = 250;
      const sidebarCollectionPromise = new Promise(() => {});
      helper.sidebarModelLoader = new SidebarModelLoader(
        'shares',
        sidebarCollectionPromise
      );
      helper.sidebarModelLoader.progressTracker = progressTracker;

      // when
      await helper.render();

      // then
      const spinnerLabel = helper.spinnerLabel;
      expect(spinnerLabel).to.include('Loading shares for 1000 spaces...');
      expect(spinnerLabel).to.include('25%');
    }
  );

  it('does not render percentage if totalCount is <= 100',
    async function () {
      const helper = new Helper(this);
      const progressTracker = new ProgressTracker(100);
      progressTracker.doneCount = 1;
      const sidebarCollectionPromise = new Promise(() => {});
      helper.sidebarModelLoader = new SidebarModelLoader(
        'shares',
        sidebarCollectionPromise
      );
      helper.sidebarModelLoader.progressTracker = progressTracker;

      // when
      await helper.render();

      // then
      const spinnerLabel = helper.spinnerLabel;
      expect(spinnerLabel.trim()).to.equal('Loading shares for 100 spaces...');
    }
  );
});

class Helper {
  /** @type {SidebarModelLoader} */
  sidebarModelLoader;

  constructor(mochaContext) {
    this.mochaContext = mochaContext;
  }

  /** @type {HTMLElement} */
  get spinnerBlock() {
    return find('.sidebar-loading-container');
  }

  get spinnerLabel() {
    return this.spinnerBlock?.textContent.trim();
  }

  async render() {
    this.mochaContext.set('sidebarModelLoader', this.sidebarModelLoader);
    await render(hbs`<SidebarLoadingContainer
      @sidebarModelLoader={{this.sidebarModelLoader}}
    />`);
  }
}
