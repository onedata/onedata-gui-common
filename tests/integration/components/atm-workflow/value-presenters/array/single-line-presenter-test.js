import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find } from '@ember/test-helpers';

describe('Integration | Component | atm workflow/value presenters/array/single line presenter', function () {
  setupRenderingTest();

  it('has classes "single-line-presenter" and "array-single-line-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/array/single-line-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('single-line-presenter')
      .and.to.have.class('array-single-line-presenter');
  });

  it('presents passed value when it is an array of datasets', async function () {
    this.setProperties({
      value: [{ rootFilePath: '/spc1/abc' }, { rootFilePath: '/spc1/def' }],
      dataSpec: {
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'dataset',
          },
        },
      },
    });
    await render(hbs`{{atm-workflow/value-presenters/array/single-line-presenter
      value=value
      dataSpec=dataSpec
    }}`);

    expect(find('.single-line-presenter')).to.have.trimmed.text(
      '[Array (2): [Dataset "abc"], [Dataset "def"]]'
    );
  });

  it('presents passed value when it is an array of arrays of strings', async function () {
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
    await render(hbs`{{atm-workflow/value-presenters/array/single-line-presenter
      value=value
      dataSpec=dataSpec
    }}`);

    expect(find('.single-line-presenter')).to.have.trimmed.text(
      '[Array (2): [Array (2): "ab", "cd"], [Array (1): "ef"]]'
    );
  });

  it('presents passed value when it is an empty array', async function () {
    this.setProperties({
      value: [],
      dataSpec: {
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'dataset',
          },
        },
      },
    });
    await render(hbs`{{atm-workflow/value-presenters/array/single-line-presenter
      value=value
      dataSpec=dataSpec
    }}`);

    expect(find('.single-line-presenter')).to.have.trimmed.text('[Array (0)]');
  });

  it('presents passed value cropped to the first 10 array items when it is a large array', async function () {
    this.setProperties({
      value: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      dataSpec: {
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'string',
          },
        },
      },
    });
    await render(hbs`{{atm-workflow/value-presenters/array/single-line-presenter
      value=value
      dataSpec=dataSpec
    }}`);

    expect(find('.single-line-presenter')).to.have.trimmed.text(
      '[Array (13): "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", …]'
    );
  });
});
