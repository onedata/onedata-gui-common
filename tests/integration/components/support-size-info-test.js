import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import {
  render,
  settled,
  click,
  findAll,
  find,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { findInElementsByText } from '../../helpers/find';

describe('Integration | Component | support-size-info', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('data', A([
      EmberObject.create({
        id: '1',
        label: 'Provider1',
        value: 1048576,
        color: 'red',
      }),
      EmberObject.create({
        id: '2',
        label: 'Provider2',
        value: 1048576,
        color: 'blue',
      }),
    ]));
  });

  it('renders total support size', async function () {
    await render(hbs `
      {{support-size-info data=data}}
    `);

    expect(find('.support-size').textContent).to.contain('2 MiB');
  });

  it('renders support size chart', async function () {
    await render(hbs `
      {{support-size-info data=data}}
    `);

    await settled();
    ['Provider1', 'Provider2'].forEach((name) => {
      expect(
        findInElementsByText(this.element.querySelectorAll('text, li'), name)
      ).to.exist;
    });
  });

  it('renders support size table', async function () {
    await render(hbs `
      {{support-size-info
        data=data
        supporterNameHeader="Provider"
        supporterSizeHeader="Support size"
      }}
    `);
    await click('.btn.table-mode');

    const dataRows = findAll('tbody tr');
    expect(dataRows).to.have.length(2);
    const dataRow = dataRows[0];
    expect(dataRow.children).to.have.length(2);
    expect(dataRow.children[0].textContent).to.contain('Provider1');
    expect(dataRow.children[1].textContent).to.contain('1 MiB');
  });
});
