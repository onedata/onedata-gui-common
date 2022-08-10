import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find, findAll, click } from '@ember/test-helpers';
import { dataSpecTypes } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import {
  getRawValuePresenter,
  getVisualValuePresenter,
} from 'onedata-gui-common/utils/atm-workflow/value-presenters';
import { replaceEmberAceWithTextarea } from '../../../../helpers/ember-ace';
import TestComponent from 'onedata-gui-common/components/test-component';

describe('Integration | Component | atm workflow/value presenters/single value presenter',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      replaceEmberAceWithTextarea(this);
    });

    it('has class "single-value-presenter"', async function () {
      await render(hbs`{{atm-workflow/value-presenters/single-value-presenter}}`);

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0]).to.have.class('single-value-presenter');
    });

    it('shows presenter type toggle with "visual" and "raw"', async function () {
      this.set('dataSpec', { type: 'range' });
      await renderComponent();

      expect(find('.presenter-type-selector')).to.exist;
      const typeButtons = findAll('.presenter-type-selector button');
      expect(typeButtons).to.have.length(2);
      expect(typeButtons[0]).to.have.class('presenter-type-visual')
        .and.to.have.class('active')
        .and.to.have.trimmed.text('Visual');
      expect(typeButtons[1]).to.have.class('presenter-type-raw')
        .and.to.have.trimmed.text('Raw');
    });

    dataSpecTypes.forEach((dataSpecType) => {
      const dataSpec = {
        type: dataSpecType,
      };

      const visualPresenterComponent = getVisualValuePresenter(dataSpec);
      const rawPresenterComponent = getRawValuePresenter(dataSpec);

      if (visualPresenterComponent) {
        it(`shows presenter type toggle and correct presenters for type "${dataSpecType}"`,
          async function () {
            const { value, context } = this.setProperties({
              dataSpec,
              value: { a: 1 },
              context: { b: 2 },
            });
            this.owner.register(
              `component:${visualPresenterComponent}`,
              TestComponent.extend({ classNames: ['visual-presenter'] })
            );
            this.owner.register(
              `component:${rawPresenterComponent}`,
              TestComponent.extend({ classNames: ['raw-presenter'] })
            );
            await renderComponent();

            expect(find('.presenter-type-selector')).to.exist;
            expect(find('.presenter-type-visual')).to.have.class('active');
            let visiblePresenter = find('.visual-presenter');
            expect(visiblePresenter).to.exist;
            expect(visiblePresenter.componentInstance.dataSpec).to.equal(dataSpec);
            expect(visiblePresenter.componentInstance.value).to.equal(value);
            expect(visiblePresenter.componentInstance.context).to.equal(context);
            expect(find('.raw-presenter')).to.not.exist;

            await click('.presenter-type-raw');
            expect(find('.presenter-type-raw')).to.have.class('active');
            visiblePresenter = find('.raw-presenter');
            expect(find('.visual-presenter')).to.not.exist;
            expect(visiblePresenter).to.exist;
            expect(visiblePresenter.componentInstance.dataSpec).to.equal(dataSpec);
            expect(visiblePresenter.componentInstance.value).to.equal(value);
            expect(visiblePresenter.componentInstance.context).to.equal(context);
          }
        );
      } else {
        it(`hides presenter type toggle and shows only raw presenter for type "${dataSpecType}"`,
          async function () {
            const { value, context } = this.setProperties({
              dataSpec,
              value: { a: 1 },
              context: { b: 2 },
            });
            this.owner.register(
              `component:${rawPresenterComponent}`,
              TestComponent.extend({ classNames: ['raw-presenter'] })
            );
            await renderComponent();

            expect(find('.presenter-type-selector')).to.not.exist;
            const visiblePresenter = find('.raw-presenter');
            expect(visiblePresenter).to.exist;
            expect(visiblePresenter.componentInstance.dataSpec).to.equal(dataSpec);
            expect(visiblePresenter.componentInstance.value).to.equal(value);
            expect(visiblePresenter.componentInstance.context).to.equal(context);
            expect(find('.visual-presenter')).to.not.exist;
          }
        );
      }
    });
  }
);

async function renderComponent() {
  await render(hbs`{{atm-workflow/value-presenters/single-value-presenter
    value=value
    dataSpec=dataSpec
    context=context
  }}`);
}
