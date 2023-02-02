import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find } from '@ember/test-helpers';
import { Promise, reject } from 'rsvp';
import { FileType } from 'onedata-gui-common/utils/file';

describe('Integration | Component | atm workflow/value presenters/dataset/visual presenter', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      context: {
        getFileUrlById: async (id) => this.get('fileUrl')(id),
        getDatasetUrlById: async (id) => this.get('datasetUrl')(id),
      },
      fileUrl: (id) => `/some/url-${id}`,
      datasetUrl: (id) => `/some/dataseturl-${id}`,
    });
  });

  it('has classes "visual-presenter" and "data-visual-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/dataset/visual-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('visual-presenter')
      .and.to.have.class('dataset-visual-presenter');
  });

  it('shows complete information about a directory dataset', async function () {
    const dataset = this.set('dataset', {
      datasetId: 'some_id',
      rootFileId: 'file_id',
      rootFilePath: '/some/path/dataset',
      rootFileType: FileType.Regular,
    });
    await render(hbs`{{atm-workflow/value-presenters/dataset/visual-presenter
      context=context
      value=dataset
    }}`);

    expect(find('.dataset-icon')).to.have.class('main-type-regular')
      .and.to.have.class('oneicon-browser-dataset-file');
    expect(find('.dataset-name')).to.have.trimmed.text('dataset')
      .and.to.match('a')
      .and.to.have.attr('href', this.get('datasetUrl')(dataset.datasetId));
    expect(find('.root-file-path-property .property-value a'))
      .to.have.trimmed.text(dataset.rootFilePath)
      .and.to.have.attr('href', this.get('fileUrl')(dataset.rootFileId));
  });

  it('shows different icon for a regular file dataset', async function () {
    this.set('dataset', {
      datasetId: 'some_id',
      rootFileId: 'file_id',
      rootFilePath: '/some/path/dataset',
      rootFileType: FileType.Directory,
    });
    await render(hbs`{{atm-workflow/value-presenters/dataset/visual-presenter
      context=context
      value=dataset
    }}`);

    expect(find('.dataset-icon')).to.have.class('main-type-directory')
      .and.to.have.class('oneicon-browser-dataset');
  });

  it('handles case when all dataset properties are missing', async function () {
    this.set('dataset', null);
    await render(hbs`{{atm-workflow/value-presenters/dataset/visual-presenter
      context=context
      value=dataset
    }}`);

    expect(find('.dataset-icon')).to.have.class('main-type-regular')
      .and.to.have.class('oneicon-browser-dataset-file');
    expect(find('.dataset-name')).to.have.trimmed.text('Unknown')
      .and.to.match('span')
      .and.to.not.have.attr('href');
    expect(find('.root-file-path-property .property-value'))
      .to.have.trimmed.text('Unknown')
      .and.to.not.contain('a');
  });

  it('handles case when all dataset properties are missing except ID', async function () {
    const dataset = this.set('dataset', {
      datasetId: 'some_id',
    });
    await render(hbs`{{atm-workflow/value-presenters/dataset/visual-presenter
      context=context
      value=dataset
    }}`);

    expect(find('.dataset-icon')).to.have.class('main-type-regular')
      .and.to.have.class('oneicon-browser-dataset-file');
    expect(find('.dataset-name')).to.have.trimmed.text('Unknown')
      .and.to.match('a')
      .and.to.have.attr('href', this.get('datasetUrl')(dataset.datasetId));
    expect(find('.root-file-path-property .property-value'))
      .to.have.trimmed.text('Unknown')
      .and.to.not.contain('a');
  });

  it('shows available information about a dataset when all info callbacks resolve to null',
    async function () {
      const { dataset } = this.setProperties({
        dataset: {
          datasetId: 'some_id',
          rootFileId: 'file_id',
          rootFilePath: '/some/path/dataset',
          rootFileType: FileType.Regular,
        },
        fileUrl: () => null,
        datasetUrl: () => null,
      });
      await render(hbs`{{atm-workflow/value-presenters/dataset/visual-presenter
        context=context
        value=dataset
      }}`);

      expect(find('.dataset-icon')).to.have.class('main-type-regular')
        .and.to.have.class('oneicon-browser-dataset-file');
      expect(find('.dataset-name')).to.have.trimmed.text('dataset')
        .and.to.match('span')
        .and.to.not.have.attr('href');
      expect(find('.root-file-path-property .property-value'))
        .to.have.trimmed.text(dataset.rootFilePath)
        .and.to.not.contain('a');
    }
  );

  it('shows available information about a dataset when all info callbacks reject',
    async function () {
      const { dataset } = this.setProperties({
        dataset: {
          datasetId: 'some_id',
          rootFileId: 'file_id',
          rootFilePath: '/some/path/dataset',
          rootFileType: FileType.Regular,
        },
        fileUrl: () => reject('someError1'),
        datasetUrl: () => reject('someError2'),
      });
      await render(hbs`{{atm-workflow/value-presenters/dataset/visual-presenter
        context=context
        value=dataset
      }}`);

      expect(find('.dataset-icon')).to.have.class('main-type-regular')
        .and.to.have.class('oneicon-browser-dataset-file');
      expect(find('.dataset-name')).to.have.trimmed.text('dataset')
        .and.to.match('span')
        .and.to.not.have.attr('href');
      expect(find('.root-file-path-property .property-value'))
        .to.have.trimmed.text(dataset.rootFilePath)
        .and.to.not.contain('a');
    }
  );

  it('shows available information about a dataset when info callbacks are pending', async function () {
    const { dataset } = this.setProperties({
      dataset: {
        datasetId: 'some_id',
        rootFileId: 'file_id',
        rootFilePath: '/some/path/dataset',
        rootFileType: FileType.Regular,
      },
      fileUrl: () => new Promise(() => {}),
      datasetUrl: () => new Promise(() => {}),
    });
    await render(hbs`{{atm-workflow/value-presenters/dataset/visual-presenter
      context=context
      value=dataset
    }}`);

    expect(find('.dataset-icon')).to.have.class('main-type-regular')
      .and.to.have.class('oneicon-browser-dataset-file');
    expect(find('.dataset-name')).to.have.trimmed.text('dataset')
      .and.to.match('span')
      .and.to.not.have.attr('href');
    expect(find('.root-file-path-property .property-value'))
      .to.have.trimmed.text(dataset.rootFilePath)
      .and.to.not.contain('a');
  });

  it('shows available information about a dataset when context is not present',
    async function () {
      const { dataset } = this.setProperties({
        dataset: {
          datasetId: 'some_id',
          rootFileId: 'file_id',
          rootFilePath: '/some/path/dataset',
          rootFileType: FileType.Regular,
        },
      });
      await render(hbs`{{atm-workflow/value-presenters/dataset/visual-presenter
        value=dataset
      }}`);

      expect(find('.dataset-icon')).to.have.class('main-type-regular')
        .and.to.have.class('oneicon-browser-dataset-file');
      expect(find('.dataset-name')).to.have.trimmed.text('dataset')
        .and.to.match('span')
        .and.to.not.have.attr('href');
      expect(find('.root-file-path-property .property-value'))
        .to.have.trimmed.text(dataset.rootFilePath)
        .and.to.not.contain('a');
    }
  );
});
