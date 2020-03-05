import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one space indicator', function () {
  setupComponentTest('one-space-indicator', {
    integration: true,
  });

  it('renders space usage', function () {
    this.render(hbs `{{one-space-indicator currentTotalSize=2048 occupiedSize=1024}}`);

    expect(this.$('.occupied-space-bar')).to.exist;
    expect(this.$('.current-total-space').text().trim()).to.equal('2 KiB');
    expect(this.$('.occupied-space').text().trim()).to.equal('1 KiB');
  });

  it('recognizes occupied space greater than total space', function () {
    this.render(hbs `{{one-space-indicator currentTotalSize=2048 occupiedSize=4096}}`);

    expect(this.$('.one-space-indicator')).to.have.class('critical-usage');
    expect(this.$('.occupied-space-bar')).to.exist;
    expect(this.$('.current-total-space').text().trim()).to.equal('2 KiB');
    expect(this.$('.occupied-space').text().trim()).to.equal('4 KiB');
  });

  it('ignores occupied space less than 0', function () {
    this.render(hbs `{{one-space-indicator currentTotalSize=2048 occupiedSize=-10}}`);

    expect(this.$('.occupied-space-bar')).to.not.exist;
    expect(this.$('.current-total-space')).to.not.exist;
    expect(this.$('.occupied-space')).to.not.exist;
  });

  it('ignores total space less than 0', function () {
    this.render(hbs `{{one-space-indicator currentTotalSize=-10 occupiedSize=1024}}`);

    expect(this.$('.occupied-space-bar')).to.not.exist;
    expect(this.$('.current-total-space')).to.not.exist;
    expect(this.$('.occupied-space')).to.not.exist;
  });

  it('renders right expand arrow if expanding the space', function () {
    this.render(hbs `{{one-space-indicator
      currentTotalSize=100
      occupiedSize=50
      newTotalSize=150
    }}`);

    expect(
      this.$('.new-total-space-expand-right.new-total-space-expand-arrow'),
      'right expand arrow'
    ).to.exist;
  });

  it('renders right expand without arrow if expanding the space a little', function () {
    this.render(hbs `{{one-space-indicator
      currentTotalSize=100
      occupiedSize=50
      newTotalSize=101
    }}`);

    expect(
      this.$('.new-total-space-expand-right'),
      'right expand'
    ).to.exist;

    expect(this.$('.new-total-space-expand-arrow'), 'arrow').to.not.exist;
  });

  it('renders left expand arrow if shrinking the space', function () {
    this.render(hbs `{{one-space-indicator
      currentTotalSize=100
      occupiedSize=10
      newTotalSize=50
    }}`);

    expect(
      this.$('.new-total-space-expand-left.new-total-space-expand-arrow'),
      'left expand arrow'
    ).to.exist;
  });

  it('renders left expand without arrow if shrinking the space a little', function () {
    this.render(hbs `{{one-space-indicator
      currentTotalSize=100
      occupiedSize=50
      newTotalSize=99
    }}`);

    expect(
      this.$('.new-total-space-expand-left'),
      'left expand'
    ).to.exist;

    expect(this.$('.new-total-space-expand-arrow'), 'arrow').to.not.exist;
  });

  it('renders critical color if shrinking the space below usage', function () {
    this.render(hbs `{{one-space-indicator
      currentTotalSize=100
      occupiedSize=70
      newTotalSize=50
    }}`);

    expect(
      this.$('.critical-usage'),
      'critical usage class'
    ).to.exist;
  });

  it('renders warning color if shrinking the space to warning value', function () {
    this.render(hbs `{{one-space-indicator
      currentTotalSize=100
      occupiedSize=70
      newTotalSize=71
    }}`);

    expect(
      this.$('.warning-usage'),
      'warning usage class'
    ).to.exist;
  });

  it('clears critical usage if expanding the space above usage', function () {
    this.render(hbs `{{one-space-indicator
      currentTotalSize=100
      occupiedSize=101
      newTotalSize=120
    }}`);

    expect(
      this.$('.critical-usage'),
      'critical usage class'
    ).to.not.exist;
  });
});
