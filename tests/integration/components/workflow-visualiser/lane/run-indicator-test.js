import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import OneTooltipHelper from '../../../../helpers/one-tooltip';

const componentClassName = 'run-indicator';

const statuses = [{
  name: 'scheduled',
  translation: 'Scheduled',
}, {
  name: 'preparing',
  translation: 'Preparing',
}, {
  name: 'enqueued',
  translation: 'Enqueued',
}, {
  name: 'active',
  translation: 'Active',
}, {
  name: 'aborting',
  translation: 'Aborting',
}, {
  name: 'cancelled',
  translation: 'Cancelled',
}, {
  name: 'skipped',
  translation: 'Skipped',
}, {
  name: 'finished',
  translation: 'Finished',
}, {
  name: 'failed',
  translation: 'Failed',
}, {
  name: 'unknown',
  translation: 'Unknown',
}];

describe('Integration | Component | workflow visualiser/lane/run indicator', function () {
  setupComponentTest('workflow-visualiser/lane/run-indicator', {
    integration: true,
  });

  it(`has class "${componentClassName}"`, async function () {
    await render(this);

    expect(this.$().children().eq(0)).to.have.class(componentClassName);
  });

  it('has class "status-unknown" when status is not specified', async function () {
    await render(this);

    expect(getComponent(this)).to.have.class('status-unknown');
  });

  for (const { name } of statuses) {
    itHasStatusClass(name);
  }
  itHasStatusClass('incorrect status', 'unknown');

  it('shows "?" as a run number, when it is not specified', async function () {
    await render(this);

    expect(getComponent(this).find('.run-no').text().trim()).to.equal('?');
  });

  it('shows "?" as a run number, when passed number is not correct', async function () {
    this.set('runNo', -1);

    await render(this);

    expect(getComponent(this).find('.run-no').text().trim()).to.equal('?');
  });

  it('shows "1" as a run number, when passed number is "1"', async function () {
    this.set('runNo', 1);

    await render(this);

    expect(getComponent(this).find('.run-no').text().trim()).to.equal('1');
  });

  it('has class "one-digit-run" when run number is < 10', async function () {
    this.set('runNo', 4);

    await render(this);

    expect(getComponent(this)).to.have.class('one-digit-run');
  });

  it('has class "two-digit-run" when run number is >= 10 && < 100', async function () {
    this.set('runNo', 34);

    await render(this);

    expect(getComponent(this)).to.have.class('two-digit-run');
  });

  it('has class "many-digit-run" when run number is >= 10', async function () {
    this.set('runNo', 456);

    await render(this);

    expect(getComponent(this)).to.have.class('many-digit-run');
  });

  it('does not have class "active" when "isActive" is set to false', async function () {
    this.set('isActive', false);

    await render(this);

    expect(getComponent(this)).to.not.have.class('active');
  });

  it('has class "active" when "isActive" is set to true', async function () {
    this.set('isActive', true);

    await render(this);

    expect(getComponent(this)).to.have.class('active');
  });

  it('does not show source run number if not provided', async function () {
    await render(this);

    expect(getComponent(this).find('.source-run-no')).to.not.exist;
  });

  it('does not show source run number if passed number is not correct', async function () {
    this.set('sourceRunNo', -1);

    await render(this);

    expect(getComponent(this).find('.source-run-no')).to.not.exist;
  });

  it('shows source run number "1" if passed number is "1"', async function () {
    this.set('sourceRunNo', 1);

    await render(this);

    expect(getComponent(this).find('.source-run-no').text().trim()).to.equal('1');
  });

  it('does not have class "clickable" by default', async function () {
    await render(this);

    expect(getComponent(this)).to.not.have.class('clickable');
  });

  it('has class "clickable" when click handler is specified', async function () {
    this.set('onClick', () => {});

    await render(this);

    expect(getComponent(this)).to.have.class('clickable');
  });

  it('has correct tooltip for first run', async function () {
    this.setProperties({
      runNo: 1,
      status: 'active',
    });

    await render(this);

    const tooltipHelper = new OneTooltipHelper(`.${componentClassName}`);
    expect(await tooltipHelper.getText()).to.match(/^Run: 1(\s)+Status: Active$/);
  });

  it('has correct tooltip for n-th run', async function () {
    this.setProperties({
      runNo: 4,
      sourceRunNo: 2,
      status: 'active',
    });

    await render(this);

    const tooltipHelper = new OneTooltipHelper(`.${componentClassName}`);
    expect(await tooltipHelper.getText()).to.match(/^Run: 4(\s)+Source run: 2(\s)+Status: Active$/);
  });

  for (const { name, translation } of statuses) {
    itHasCorrectTooltipWithStatus(name, translation);
  }
  itHasCorrectTooltipWithStatus('incorrect status', 'Unknown');
});

async function render(testCase) {
  testCase.render(hbs `{{workflow-visualiser/lane/run-indicator
    status=status
    runNo=runNo
    sourceRunNo=sourceRunNo
    isActive=isActive
    click=onClick
  }}`);
  await wait();
}

function getComponent(testCase) {
  return testCase.$(`.${componentClassName}`);
}

function itHasStatusClass(status, statusInClass) {
  const statusClass = `status-${statusInClass || status}`;
  it(`has class "${statusClass}" when status is "${status}"`, async function () {
    this.set('status', status);

    await render(this);

    expect(getComponent(this)).to.have.class(statusClass);
  });
}

function itHasCorrectTooltipWithStatus(status, statusTranslation) {
  it(`has correct tooltip for run with status "${status}"`, async function () {
    this.setProperties({
      runNo: 1,
      status,
    });

    await render(this);

    const tooltipHelper = new OneTooltipHelper(`.${componentClassName}`);
    expect(await tooltipHelper.getText()).to.match(
      new RegExp(`^Run: 1(\\s)+Status: ${statusTranslation}$`)
    );
  });
}
