import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one space indicator', function () {
  setupComponentTest('one-space-indicator', {
    integration: true
  });

  it('renders space usage', function () {
    this.render(hbs `{{one-space-indicator totalSize=2048 occupiedSize=1024}}`);

    expect(this.$('.occupied-space-bar')).to.exist;
    expect(this.$('.total-space').text().trim()).to.equal('2 KiB');
    expect(this.$('.occupied-space').text().trim()).to.equal('1 KiB');
  });

  it('recognizes occupied space greater than total space', function () {
    this.render(hbs `{{one-space-indicator totalSize=2048 occupiedSize=4096}}`);

    expect(this.$('.one-space-indicator')).to.have.class('critical-usage');
    expect(this.$('.occupied-space-bar')).to.exist;
    expect(this.$('.total-space').text().trim()).to.equal('2 KiB');
    expect(this.$('.occupied-space').text().trim()).to.equal('4 KiB');
  });

  it('ignores occupied space less than 0', function () {
    this.render(hbs `{{one-space-indicator totalSize=2048 occupiedSize=-10}}`);

    expect(this.$('.occupied-space-bar')).to.not.exist;
    expect(this.$('.total-space').text().trim()).to.equal('2 KiB');
    expect(this.$('.occupied-space')).to.not.exist;
  });

  it('ignores total space less than 0', function () {
    this.render(hbs `{{one-space-indicator totalSize=-10 occupiedSize=1024}}`);

    expect(this.$('.occupied-space-bar')).to.not.exist;
    expect(this.$('.total-space')).to.not.exist;
    expect(this.$('.occupied-space')).to.not.exist;
  });
});
