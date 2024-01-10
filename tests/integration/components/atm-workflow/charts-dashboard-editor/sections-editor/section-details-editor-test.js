import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setProperties } from '@ember/object';
import { createNewSection } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import OneDropdownHelper from '../../../../../helpers/one-dropdown';
import { ChartNavigation } from 'onedata-gui-common/utils/time-series-dashboard';

const chartNavigationDropdownHelper = new OneDropdownHelper('.chartNavigation-field');

describe('Integration | Component | atm-workflow/charts-dashboard-editor/sections-editor/section-details-editor',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      this.set('editorContext', {
        actionsFactory: {
          interruptActiveChangeElementPropertyAction: () => {},
        },
      });
    });

    it('has class "section-details-editor"', async function () {
      await renderComponent();

      expect(find('.section-details-editor')).to.exist;
    });

    it('has four fields - title, title tip, description and chart navigation',
      async function () {
        await renderComponent();

        const fields = findAll('.field-renderer:not(.form-fields-group-renderer)');
        expect(fields).to.have.length(4);

        expect(fields[0].querySelector('.control-label')).to.contain.text('Title');
        expect(fields[0].querySelector('input[type="text"]')).to.exist
          .and.to.have.attr('placeholder', 'No title');

        expect(fields[1].querySelector('.control-label')).to.contain.text('Title tip');
        expect(fields[1].querySelector('textarea')).to.exist
          .and.to.have.attr('placeholder', 'No title tip');

        expect(fields[2].querySelector('.control-label')).to.contain.text('Description');
        expect(fields[2].querySelector('textarea')).to.exist
          .and.to.have.attr('placeholder', 'No description');

        expect(fields[3].querySelector('.control-label')).to.contain.text('Chart navigation');
        expect(await chartNavigationDropdownHelper.getOptionsText()).to.deep.equal([
          'Independent',
          'Shared within section',
        ]);
      }
    );

    it('shows section data in fields', async function () {
      this.set('section', createSection(this, {
        title: 'title',
        titleTip: 'tip',
        description: 'desc',
        chartNavigation: ChartNavigation.Independent,
      }));

      await renderComponent();

      expect(find('.title-field .form-control')).to.have.value('title');
      expect(find('.titleTip-field .form-control')).to.have.value('tip');
      expect(find('.description-field .form-control')).to.have.value('desc');
      expect(chartNavigationDropdownHelper.getSelectedOptionText())
        .to.equal('Independent');
    });

    it('updates field values when section data changes', async function () {
      this.set('section', createSection(this, {
        title: 'title',
        titleTip: 'tip',
        description: 'desc',
        chartNavigation: ChartNavigation.Independent,
      }));
      await renderComponent();

      this.set('section.title', 'title2');
      await settled();

      expect(find('.title-field .form-control')).to.have.value('title2');

      this.set('section.titleTip', 'tip2');
      await settled();

      expect(find('.titleTip-field .form-control')).to.have.value('tip2');

      this.set('section.description', 'desc2');
      await settled();
      expect(find('.description-field .form-control')).to.have.value('desc2');

      this.set('section.chartNavigation', ChartNavigation.SharedWithinSection);
      await settled();
      expect(chartNavigationDropdownHelper.getSelectedOptionText())
        .to.equal('Shared within section');
    });
  }
);

function createSection(testCase, props = {}) {
  const section = createNewSection(testCase.owner.lookup('service:i18n'));
  setProperties(section, props);
  return section;
}

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/sections-editor/section-details-editor
    section=section
    editorContext=editorContext
  }}`);
}
