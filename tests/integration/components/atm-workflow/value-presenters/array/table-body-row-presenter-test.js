import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, findAll } from '@ember/test-helpers';

describe('Integration | Component | atm workflow/value presenters/array/table body row presenter', function () {
  setupRenderingTest();

  it('has classes "table-body-row-presenter" and "array-table-body-row-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/array/table-body-row-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('table-body-row-presenter')
      .and.to.have.class('array-table-body-row-presenter');
  });

  it('shows single column - value', async function () {
    this.setProperties({
      value: [
        ['ab', 'cd'],
        ['ef'],
      ],
      dataSpec: {
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'array',
            valueConstraints: {
              itemDataSpec: {
                type: 'string',
              },
            },
          },
        },
      },
    });
    await render(hbs`{{atm-workflow/value-presenters/array/table-body-row-presenter
      value=value
      dataSpec=dataSpec
    }}`);

    const tds = findAll('.table-body-row-presenter td');
    expect(tds).to.have.length(1);
    expect(tds[0]).to.have.class('column-value')
      .and.to.have.trimmed.text('[Array (2): [Array (2): "ab", "cd"], [Array (1): "ef"]]')
      .and.to.contain('.array-single-line-presenter');
  });
});
