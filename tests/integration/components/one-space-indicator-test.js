import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';

describe('Integration | Component | one space indicator', function () {
  setupRenderingTest();

  it('renders space usage', async function () {
    await render(hbs `{{one-space-indicator currentTotalSize=2048 occupiedSize=1024}}`);

    expect(find('.occupied-space-bar')).to.exist;
    expect(find('.current-total-space').textContent.trim()).to.equal('2 KiB');
    expect(find('.occupied-space').textContent.trim()).to.equal('1 KiB');
  });

  it('recognizes occupied space greater than total space', async function () {
    await render(hbs `{{one-space-indicator currentTotalSize=2048 occupiedSize=4096}}`);

    expect($(find('.one-space-indicator'))).to.have.class('critical-usage');
    expect(find('.occupied-space-bar')).to.exist;
    expect(find('.current-total-space').textContent.trim()).to.equal('2 KiB');
    expect(find('.occupied-space').textContent.trim()).to.equal('4 KiB');
  });

  it('ignores occupied space less than 0', async function () {
    await render(hbs `{{one-space-indicator currentTotalSize=2048 occupiedSize=-10}}`);

    expect(find('.occupied-space-bar')).to.not.exist;
    expect(find('.current-total-space')).to.not.exist;
    expect(find('.occupied-space')).to.not.exist;
  });

  it('ignores total space less than 0', async function () {
    await render(hbs `{{one-space-indicator currentTotalSize=-10 occupiedSize=1024}}`);

    expect(find('.occupied-space-bar')).to.not.exist;
    expect(find('.current-total-space')).to.not.exist;
    expect(find('.occupied-space')).to.not.exist;
  });

  it('renders right expand arrow if expanding the space', async function () {
    await render(hbs `{{one-space-indicator
      currentTotalSize=100
      occupiedSize=50
      newTotalSize=150
    }}`);

    expect(
      find('.new-total-space-expand-right.new-total-space-expand-arrow'),
      'right expand arrow'
    ).to.exist;
  });

  it('renders right expand without arrow if expanding the space a little', async function () {
    await render(hbs `{{one-space-indicator
      currentTotalSize=100
      occupiedSize=50
      newTotalSize=101
    }}`);

    expect(
      find('.new-total-space-expand-right'),
      'right expand'
    ).to.exist;

    expect(find('.new-total-space-expand-arrow'), 'arrow').to.not.exist;
  });

  it('renders left expand arrow if shrinking the space', async function () {
    await render(hbs `{{one-space-indicator
      currentTotalSize=100
      occupiedSize=10
      newTotalSize=50
    }}`);

    expect(
      find('.new-total-space-expand-left.new-total-space-expand-arrow'),
      'left expand arrow'
    ).to.exist;
  });

  it('renders left expand without arrow if shrinking the space a little', async function () {
    await render(hbs `{{one-space-indicator
      currentTotalSize=100
      occupiedSize=50
      newTotalSize=99
    }}`);

    expect(
      find('.new-total-space-expand-left'),
      'left expand'
    ).to.exist;

    expect(find('.new-total-space-expand-arrow'), 'arrow').to.not.exist;
  });

  it('renders critical color if shrinking the space below usage', async function () {
    await render(hbs `{{one-space-indicator
      currentTotalSize=100
      occupiedSize=70
      newTotalSize=50
    }}`);

    expect(
      find('.critical-usage'),
      'critical usage class'
    ).to.exist;
  });

  it('renders warning color if shrinking the space to warning value', async function () {
    await render(hbs `{{one-space-indicator
      currentTotalSize=100
      occupiedSize=70
      newTotalSize=71
    }}`);

    expect(
      find('.warning-usage'),
      'warning usage class'
    ).to.exist;
  });

  it('clears critical usage if expanding the space above usage', async function () {
    await render(hbs `{{one-space-indicator
      currentTotalSize=100
      occupiedSize=101
      newTotalSize=120
    }}`);

    expect(
      find('.critical-usage'),
      'critical usage class'
    ).to.not.exist;
  });
});
