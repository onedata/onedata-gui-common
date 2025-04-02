import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { find } from 'ember-test-helpers';
import SidebarModelLoader from 'onedata-gui-common/utils/sidebar-model-loader';
import SidebarBatchProgress from 'onedata-gui-common/utils/sidebar-batch-progress';
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
      const batchProgress = new SidebarBatchProgress(100);
      batchProgress.doneCount = 25;
      const sidebarCollectionPromise = new Promise(() => {});
      helper.sidebarModelLoader = new SidebarModelLoader(
        'spaces',
        sidebarCollectionPromise
      );
      helper.sidebarModelLoader.batchProgress = batchProgress;

      // when
      await helper.render();

      // then
      const spinnerLabel = helper.spinnerLabel;
      expect(spinnerLabel).to.include('Loading 100 spaces...');
      expect(spinnerLabel).to.include('25%');
    }
  );

  it('renders percentage progress as floor integer',
    async function () {
      const helper = new Helper(this);
      const batchProgress = new SidebarBatchProgress(6);
      const sidebarCollectionPromise = new Promise(() => {});
      helper.sidebarModelLoader = new SidebarModelLoader(
        'spaces',
        sidebarCollectionPromise
      );
      helper.sidebarModelLoader.batchProgress = batchProgress;

      // when
      batchProgress.doneCount = 1;
      await helper.render();

      // then
      expect(helper.spinnerLabel).to.include('16%');
    }
  );

  it('renders percentage progress updates',
    async function () {
      const helper = new Helper(this);
      const batchProgress = new SidebarBatchProgress(100);
      const sidebarCollectionPromise = new Promise(() => {});
      helper.sidebarModelLoader = new SidebarModelLoader(
        'spaces',
        sidebarCollectionPromise
      );
      helper.sidebarModelLoader.batchProgress = batchProgress;

      // when-then (25%)
      batchProgress.doneCount = 25;
      await helper.render();
      expect(helper.spinnerLabel).to.include('25%');

      // when-then (50%)
      batchProgress.doneCount = 50;
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
      const batchProgress = new SidebarBatchProgress(100);
      batchProgress.doneCount = 25;
      const sidebarCollectionPromise = new Promise(() => {});
      helper.sidebarModelLoader = new SidebarModelLoader(
        'shares',
        sidebarCollectionPromise
      );
      helper.sidebarModelLoader.batchProgress = batchProgress;

      // when
      await helper.render();

      // then
      const spinnerLabel = helper.spinnerLabel;
      expect(spinnerLabel).to.include('Loading shares for 100 spaces...');
      expect(spinnerLabel).to.include('25%');
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
