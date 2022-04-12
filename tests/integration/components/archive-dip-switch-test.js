import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import $ from 'jquery';

describe('Integration | Component | archive dip switch', function () {
  setupRenderingTest();

  it('displays DIP as active if archiveDipMode is "dip"', async function () {
    this.set('archiveDipMode', 'dip');

    await render(hbs `{{archive-dip-switch
      archiveDipMode=archiveDipMode
    }}`);

    expect($(find('.select-archive-dip-btn')), 'dip btn').to.have.class('active');
  });

  it('renders both options as disabled when disabled option is true', async function () {
    this.setProperties({
      archiveDipMode: 'aip',
      disabled: true,
    });

    await render(hbs `{{archive-dip-switch
      archiveDipMode=archiveDipMode
      disabled=disabled
    }}`);

    expect($(find('.select-archive-aip-btn'))).to.be.disabled;
    expect($(find('.select-archive-dip-btn'))).to.be.disabled;
  });

  it('calls passed archiveDipModeChanged action with selected mode', async function () {
    const onArchiveDipModeChange = sinon.spy();
    this.setProperties({
      archiveDipMode: 'aip',
      onArchiveDipModeChange,
    });

    await render(hbs `{{archive-dip-switch
      archiveDipMode=archiveDipMode
      onArchiveDipModeChange=onArchiveDipModeChange
    }}`);
    $(find('.select-archive-dip-btn')).click();

    expect(onArchiveDipModeChange).to.be.calledOnce;
    expect(onArchiveDipModeChange).to.be.calledWith('dip');
  });
});
