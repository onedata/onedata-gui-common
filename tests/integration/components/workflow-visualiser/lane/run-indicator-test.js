import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import OneTooltipHelper from '../../../../helpers/one-tooltip';

const componentClassName = 'run-indicator';

const statuses = [{
  name: 'pending',
  translation: 'pending',
}, {
  name: 'resuming',
  translation: 'resuming',
}, {
  name: 'scheduled',
  translation: 'scheduled',
}, {
  name: 'preparing',
  translation: 'preparing',
}, {
  name: 'enqueued',
  translation: 'enqueued',
}, {
  name: 'active',
  translation: 'active',
}, {
  name: 'stopping',
  translation: 'stopping',
}, {
  name: 'interrupted',
  translation: 'interrupted',
}, {
  name: 'paused',
  translation: 'paused',
}, {
  name: 'cancelled',
  translation: 'cancelled',
}, {
  name: 'skipped',
  translation: 'skipped',
}, {
  name: 'finished',
  translation: 'finished',
}, {
  name: 'failed',
  translation: 'failed',
}, {
  name: 'crashed',
  translation: 'crashed',
}, {
  name: 'unscheduled',
  translation: 'unscheduled',
}, {
  name: 'unknown',
  translation: 'unknown',
}];

const runTypes = [{
  name: 'regular',
  translation: 'regular',
}, {
  name: 'rerun',
  translation: 'rerun',
}, {
  name: 'retry',
  translation: 'retry',
}];

describe('Integration | Component | workflow visualiser/lane/run indicator', function () {
  setupRenderingTest();

  it(`has class "${componentClassName}"`, async function () {
    await renderComponent();

    expect(this.element.children[0]).to.have.class(componentClassName);
  });

  it('has class "status-unknown" when status is not specified', async function () {
    await renderComponent();

    expect(getComponent()).to.have.class('status-unknown');
  });

  for (const { name } of statuses) {
    itHasStatusClass(name);
  }
  itHasStatusClass('incorrect status', 'unknown');

  it('shows "?" as a run number, when it is not specified', async function () {
    await renderComponent();

    expect(getComponent().querySelector('.run-number').textContent.trim()).to.equal('?');
  });

  it('shows "?" as a run number, when passed number is not correct', async function () {
    this.set('runNumber', -1);

    await renderComponent();

    expect(getComponent().querySelector('.run-number').textContent.trim()).to.equal('?');
  });

  it('shows "1" as a run number, when passed number is "1"', async function () {
    this.set('runNumber', 1);

    await renderComponent();

    expect(getComponent().querySelector('.run-number').textContent.trim()).to.equal('1');
  });

  it('has class "one-digit-run" when run number is < 10', async function () {
    this.set('runNumber', 4);

    await renderComponent();

    expect(getComponent()).to.have.class('one-digit-run');
  });

  it('has class "two-digit-run" when run number is >= 10 && < 100', async function () {
    this.set('runNumber', 34);

    await renderComponent();

    expect(getComponent()).to.have.class('two-digit-run');
  });

  it('has class "many-digit-run" when run number is >= 10', async function () {
    this.set('runNumber', 456);

    await renderComponent();

    expect(getComponent()).to.have.class('many-digit-run');
  });

  it('does not have class "selected" when "isSelected" is set to false', async function () {
    this.set('isSelected', false);

    await renderComponent();

    expect(getComponent()).to.not.have.class('selected');
  });

  it('has class "selected" when "isSelected" is set to true', async function () {
    this.set('isSelected', true);

    await renderComponent();

    expect(getComponent()).to.have.class('selected');
  });

  it('does not show origin run number if not provided', async function () {
    await renderComponent();

    expect(getComponent().querySelector('.origin-run-number')).to.not.exist;
  });

  it('does not show origin run number if passed number is not correct', async function () {
    this.set('originRunNumber', -1);

    await renderComponent();

    expect(getComponent().querySelector('.origin-run-number')).to.not.exist;
  });

  it('does not show origin run number if passed number differs by 1 from run number', async function () {
    this.setProperties({
      originRunNumber: 1,
      runNumber: 2,
    });

    await renderComponent();

    expect(getComponent().querySelector('.origin-run-number')).to.not.exist;
  });

  it('shows origin run number "1" if passed number is "1" and run number differs by more than 1 from run number',
    async function () {
      this.setProperties({
        originRunNumber: 1,
        runNumber: 3,
      });

      await renderComponent();

      expect(getComponent().querySelector('.origin-run-number').textContent.trim())
        .to.equal('1');
    });

  it('does not have class "clickable" by default', async function () {
    await renderComponent();

    expect(getComponent()).to.not.have.class('clickable');
  });

  it('has class "clickable" when click handler is specified', async function () {
    this.set('onClick', () => {});

    await renderComponent();

    expect(getComponent()).to.have.class('clickable');
  });

  it('has correct tooltip for first run', async function () {
    this.setProperties({
      runNumber: 1,
      status: 'active',
      runType: 'regular',
    });

    await renderComponent();

    const tooltipHelper = new OneTooltipHelper(`.${componentClassName}`);
    expect(await tooltipHelper.getText()).to.match(/^Run: 1(\s)+Run type: regular(\s)+Status: active$/);
  });

  it('has correct tooltip for n-th run', async function () {
    this.setProperties({
      runNumber: 4,
      originRunNumber: 2,
      status: 'active',
      runType: 'rerun',
    });

    await renderComponent();

    const tooltipHelper = new OneTooltipHelper(`.${componentClassName}`);
    expect(await tooltipHelper.getText()).to.match(
      /^Run: 4(\s)+Origin run: 2(\s)+Run type: rerun(\s)+Status: active$/);
  });

  it('it does not show run type in tooltip, if its value is incorrect', async function () {
    this.setProperties({
      runNumber: 1,
      runType: 'abcd',
    });

    await renderComponent();

    const tooltipHelper = new OneTooltipHelper(`.${componentClassName}`);
    expect(await tooltipHelper.getText()).to.not.contain('Run type');
  });

  it('it does not show run type in tooltip, if its value is empty', async function () {
    this.set('runNumber', 1);

    await renderComponent();

    const tooltipHelper = new OneTooltipHelper(`.${componentClassName}`);
    expect(await tooltipHelper.getText()).to.not.contain('Run type');
  });

  for (const { name, translation } of statuses) {
    itHasCorrectTooltipWithStatus(name, translation);
  }
  itHasCorrectTooltipWithStatus('incorrect status', 'unknown');

  for (const { name, translation } of runTypes) {
    itHasCorrectTooltipWithRunType(name, translation);
  }
});

async function renderComponent() {
  await render(hbs `{{workflow-visualiser/lane/run-indicator
    status=status
    runNumber=runNumber
    originRunNumber=originRunNumber
    runType=runType
    isSelected=isSelected
    onClick=onClick
  }}`);
}

function getComponent() {
  return find(`.${componentClassName}`);
}

function itHasStatusClass(status, statusInClass) {
  const statusClass = `status-${statusInClass || status}`;
  it(`has class "${statusClass}" when status is "${status}"`, async function () {
    this.set('status', status);

    await renderComponent();

    expect(getComponent()).to.have.class(statusClass);
  });
}

function itHasCorrectTooltipWithStatus(status, statusTranslation) {
  it(`has correct tooltip for run with status "${status}"`, async function () {
    this.setProperties({
      runNumber: 1,
      status,
    });

    await renderComponent();

    const tooltipHelper = new OneTooltipHelper(`.${componentClassName}`);
    expect(await tooltipHelper.getText()).to.match(
      new RegExp(`^Run: 1(\\s)+Status: ${statusTranslation}$`)
    );
  });
}

function itHasCorrectTooltipWithRunType(runType, runTypeTranslation) {
  it(`has correct tooltip for run of type "${runType}"`, async function () {
    this.setProperties({
      runNumber: 1,
      runType,
    });

    await renderComponent();

    const tooltipHelper = new OneTooltipHelper(`.${componentClassName}`);
    expect(await tooltipHelper.getText()).to.match(
      new RegExp(`^Run: 1(\\s)+Run type: ${runTypeTranslation}(\\s)+Status: unknown$`)
    );
  });
}
