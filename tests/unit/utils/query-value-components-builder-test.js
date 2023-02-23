import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import QueryValueComponentsBuilder from 'onedata-gui-common/utils/query-value-components-builder';

describe('Unit | Utility | query-value-components-builder', function () {
  beforeEach(function () {
    this.builder = QueryValueComponentsBuilder.create();
    this.queryProperty = {
      key: 'key1',
      displayedKey: 'Key 1',
      stringValues: [],
      numberValues: [],
      allValues: [],
    };
  });

  it('returns [ eq ] comparator for stringOptions', function () {
    expect(this.builder.getComparatorsFor('stringOptions'))
      .to.deep.equal(['stringOptions.eq']);
  });

  it('returns dropdown-editor editor for stringOptions.eq', function () {
    expect(this.builder.getEditorFor('stringOptions.eq', this.queryProperty))
      .to.have.property('componentName', 'dropdown-editor');
  });

  it('returns dropdown-editor editor for mixedOptions.eq', function () {
    expect(this.builder.getEditorFor('mixedOptions.eq', this.queryProperty))
      .to.have.property('componentName', 'dropdown-editor');
  });

  it('returns text-editor editor for string.eq', function () {
    expect(this.builder.getEditorFor('string.eq', this.queryProperty))
      .to.have.property('componentName', 'text-editor');
  });
});
