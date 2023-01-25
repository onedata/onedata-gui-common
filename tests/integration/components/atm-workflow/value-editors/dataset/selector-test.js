import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll, click, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';

describe('Integration | Component | atm-workflow/value-editors/dataset/selector', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      atmDataSpec: {
        type: AtmDataSpecType.Dataset,
      },
      editorContext: {
        selectDatasets: sinon.spy(),
      },
      allowManyDatasets: false,
      triggerText: 'trigger text',
    });
  });

  it('renders selector trigger in a form of a link with class "dataset-value-editor-selector"',
    async function () {
      await renderComponent();

      const trigger = find('a');
      expect(trigger).to.have.class('dataset-value-editor-selector');
      expect(trigger).to.have.trimmed.text(this.triggerText);
    }
  );

  it('shows "select datasets" and "enter dataset id" actions in popover after trigger click',
    async function () {
      await renderComponent();

      await click('.dataset-value-editor-selector');

      const actions = findAll('.dataset-value-editor-selector-actions a');
      expect(actions).to.have.length(2);
      expect(actions[0]).to.have.trimmed.text('Select dataset');
      expect(actions[0]).to.have.class('select-datasets-action-trigger');
      expect(actions[0].parentElement).to.not.have.class('disabled');
      expect(actions[1]).to.have.trimmed.text('Enter dataset ID');
      expect(actions[1]).to.have.class('provide-dataset-id-action-trigger');
      expect(actions[1].parentElement).to.not.have.class('disabled');
    }
  );

  it('uses different label for "select datasets" action when "allowManyDatasets" is true',
    async function () {
      this.set('allowManyDatasets', true);
      await renderComponent();

      await click('.dataset-value-editor-selector');

      expect(find('.select-datasets-action-trigger'))
        .to.have.trimmed.text('Select datasets');
    }
  );

  it('calls "onIdProvidingStarted" when "enter dataset id" action has been clicked',
    async function () {
      const actionSpy = this.set('onIdProvidingStarted', sinon.spy());
      await renderComponent();

      await click('.dataset-value-editor-selector');
      expect(actionSpy).to.be.not.called;
      await click('.provide-dataset-id-action-trigger');

      expect(actionSpy).to.be.calledOnce;
    }
  );

  it('calls "editorContext.selectDatasets" when "select datasets" action has been clicked',
    async function () {
      await renderComponent();

      await click('.dataset-value-editor-selector');
      expect(this.editorContext.selectDatasets).to.be.not.called;
      await click('.select-datasets-action-trigger');

      expect(this.editorContext.selectDatasets).to.be.calledOnce
        .and.to.be.calledWith({
          allowMany: false,
          onSelected: sinon.match.func,
          onCancelled: sinon.match.func,
        });
    }
  );

  it('calls "onDatasetsSelected" when "select datasets" action has been clicked and datasets have been selected',
    async function () {
      const datasetsToSelect = [{ datasetId: '1' }];
      let onSelectedCallback;
      this.set('editorContext.selectDatasets', ({ onSelected }) => onSelectedCallback = onSelected);
      const onDatasetsSelected = this.set('onDatasetsSelected', sinon.spy());
      await renderComponent();

      await click('.dataset-value-editor-selector');
      await click('.select-datasets-action-trigger');
      expect(onDatasetsSelected).to.be.not.called;
      onSelectedCallback(datasetsToSelect);
      await settled();

      expect(onDatasetsSelected).to.be.calledOnce.and.to.be.calledWith(datasetsToSelect);
    }
  );

  it('does not call "onDatasetsSelected" when "select datasets" action has been clicked and datasets selection has been cancelled',
    async function () {
      this.set('editorContext.selectDatasets', ({ onCancelled }) => onCancelled());
      const onDatasetsSelected = this.set('onDatasetsSelected', sinon.spy());
      await renderComponent();

      await click('.dataset-value-editor-selector');
      await click('.select-datasets-action-trigger');
      await settled();

      expect(onDatasetsSelected).to.be.not.called;
    }
  );

  it('passes custom parameters to datasets selector', async function () {
    this.set('allowManyDatasets', true);
    await renderComponent();

    await click('.dataset-value-editor-selector');
    await click('.select-datasets-action-trigger');

    expect(this.editorContext.selectDatasets).to.be.calledOnce
      .and.to.be.calledWith({
        allowMany: true,
        onSelected: sinon.match.func,
        onCancelled: sinon.match.func,
      });
  });

  it('has disabled "select datasets" action when "editorContext.selectDatasets" is not provided',
    async function () {
      this.set('editorContext.selectDatasets', undefined);
      await renderComponent();

      await click('.dataset-value-editor-selector');

      expect(find('.select-datasets-action-trigger').parentElement)
        .to.have.class('disabled');
    }
  );
});

async function renderComponent() {
  await render(hbs`{{#atm-workflow/value-editors/dataset/selector
    atmDataSpec=atmDataSpec
    editorContext=editorContext
    onDatasetsSelected=onDatasetsSelected
    onIdProvidingStarted=onIdProvidingStarted
    allowManyDatasets=allowManyDatasets
  }}
    {{triggerText}}
  {{/atm-workflow/value-editors/dataset/selector}}`);
}
