import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

describe('Integration | Component | archive dip switch', function () {
  setupComponentTest('archive-dip-switch', {
    integration: true,
  });

  it('displays DIP as active if archiveDipMode is "dip"', function () {
    this.set('archiveDipMode', 'dip');

    this.render(hbs `{{archive-dip-switch
      archiveDipMode=archiveDipMode
    }}`);

    expect(this.$('.select-archive-dip-btn'), 'dip btn').to.have.class('active');
  });

  it('renders both options as disabled when disabled option is true', function () {
    this.setProperties({
      archiveDipMode: 'aip',
      disabled: true,
    });

    this.render(hbs `{{archive-dip-switch
      archiveDipMode=archiveDipMode
      disabled=disabled
    }}`);

    expect(this.$('.select-archive-aip-btn')).to.be.disabled;
    expect(this.$('.select-archive-dip-btn')).to.be.disabled;
  });

  it('calls passed archiveDipModeChanged action with selected mode', function () {
    const onArchiveDipModeChange = sinon.spy();
    this.setProperties({
      archiveDipMode: 'aip',
      onArchiveDipModeChange,
    });

    this.render(hbs `{{archive-dip-switch
      archiveDipMode=archiveDipMode
      onArchiveDipModeChange=onArchiveDipModeChange
    }}`);
    this.$('.select-archive-dip-btn').click();

    expect(onArchiveDipModeChange).to.be.calledOnce;
    expect(onArchiveDipModeChange).to.be.calledWith('dip');
  });
});
