import { expect } from 'chai';
import { describe, it, context } from 'mocha';
import {
  atmDataSpecTypesArray,
  isAtmDataSpecMatchingFilters,
  getMatchingAtmDataSpecTypes,
  getAtmValueConstraintsConditions,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import {
  AtmFileType,
  atmFileTypesArray,
  atmFileTypeSupertypes,
  atmFileTypeSubtypes,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/types/file';
import _ from 'lodash';

const inheritanceLeafTypes = [
  'integer',
  'string',
  'array',
  'file',
  'dataset',
  'range',
  'timeSeriesMeasurement',
];

const inheritanceRootTypes = [
  'integer',
  'string',
  'array',
  'object',
];

const fileSupertypes = [
  'object',
];
const datasetSupertypes = [
  'object',
];
const rangeSupertypes = [
  'object',
];
const timeSeriesMeasurementSupertypes = [
  'object',
];

const objectSubtypes = [
  'file',
  'dataset',
  'range',
  'timeSeriesMeasurement',
];

describe('Unit | Utility | atm workflow/data spec/types', function () {
  describe('isAtmDataSpecMatchingFilters', function () {
    function testTypeOrSupertypeFilter(atmDataSpec, filteredType, result) {
      testFilter('typeOrSupertype', atmDataSpec, filteredType, result);
    }

    function testTypeOrSubtypeFilter(atmDataSpec, filteredType, result) {
      testFilter('typeOrSubtype', atmDataSpec, filteredType, result);
    }

    function testForbiddenTypeFilter(atmDataSpec, filteredType, result) {
      testFilter('forbiddenType', atmDataSpec, filteredType, result);
    }

    function testFilter(filterType, atmDataSpec, filteredType, result) {
      it(`returns ${result} for ${JSON.stringify(atmDataSpec)} data spec and ${JSON.stringify(filteredType)} filtered type`,
        function () {
          const filters = [{
            filterType,
            types: [filteredType],
          }];

          expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.equal(result);
        });
    }

    it('returns true when there are no filters', function () {
      const filters = [];
      const atmDataSpec = {
        type: 'file',
      };

      expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.true;
    });

    it('returns true only when all filters are fulfilled', function () {
      const filters = [{
        filterType: 'typeOrSubtype',
        types: [{ type: 'object' }],
      }, {
        filterType: 'forbiddenType',
        types: [{ type: 'dataset' }],
      }];
      const atmDataSpec = {
        type: 'file',
      };

      expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.true;
    });

    it('returns false when one of filters is not fulfilled', function () {
      const filters = [{
        filterType: 'typeOrSubtype',
        types: [{ type: 'object' }],
      }, {
        filterType: 'forbiddenType',
        types: [{ type: 'dataset' }],
      }];
      const atmDataSpec = {
        type: 'dataset',
      };

      expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.false;
    });

    context('when using "typeOrSupertype" filter', function () {
      it('returns true when there are no types defined', function () {
        const filters = [{
          filterType: 'typeOrSupertype',
          types: [],
        }];
        const atmDataSpec = {
          type: 'file',
        };

        expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.true;
      });

      it('returns true when at least one type matches', function () {
        const filters = [{
          filterType: 'typeOrSupertype',
          types: [{ type: 'dataset' }, { type: 'file' }],
        }];
        const atmDataSpec = {
          type: 'file',
        };

        expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.true;
      });

      it('returns false when none of types match', function () {
        const filters = [{
          filterType: 'typeOrSupertype',
          types: [{ type: 'dataset' }, { type: 'integer' }],
        }];
        const atmDataSpec = {
          type: 'file',
        };

        expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.false;
      });

      inheritanceLeafTypes.forEach((atmDataSpecType) => {
        testTypeOrSupertypeFilter({
          type: atmDataSpecType,
        }, {
          type: atmDataSpecType,
        }, true);
        _.difference(atmDataSpecTypesArray, [atmDataSpecType])
          .forEach((filteredAtmDataSpecType) => {
            testTypeOrSupertypeFilter({
              type: atmDataSpecType,
            }, {
              type: filteredAtmDataSpecType,
            }, false);
          });
      });

      atmFileTypesArray.forEach((atmFileType) => {
        testTypeOrSupertypeFilter({
          type: 'file',
          valueConstraints: {
            fileType: atmFileType,
          },
        }, {
          type: 'file',
          valueConstraints: {
            fileType: atmFileType,
          },
        }, true);
        atmFileTypeSupertypes[atmFileType].forEach((atmFileTypeSupertype) => {
          testTypeOrSupertypeFilter({
            type: 'file',
            valueConstraints: {
              fileType: atmFileTypeSupertype,
            },
          }, {
            type: 'file',
            valueConstraints: {
              fileType: atmFileType,
            },
          }, true);
        });
        _.difference(atmFileTypesArray, atmFileTypeSupertypes[atmFileType], [atmFileType])
          .forEach((invalidAtmFileTypeSupertype) => {
            testTypeOrSupertypeFilter({
              type: 'file',
              valueConstraints: {
                fileType: invalidAtmFileTypeSupertype,
              },
            }, {
              type: 'file',
              valueConstraints: {
                fileType: atmFileType,
              },
            }, false);
          });
      });

      const objectTypeOrSubtypes = [
        'object',
        ...objectSubtypes,
      ];
      objectTypeOrSubtypes.forEach((objectTypeOrSubtype) => {
        testTypeOrSupertypeFilter({
          type: 'object',
        }, {
          type: objectTypeOrSubtype,
        }, true);
      });
      _.difference(atmDataSpecTypesArray, objectTypeOrSubtypes)
        .forEach((typeNotInherited) => {
          testTypeOrSupertypeFilter({
            type: 'object',
          }, {
            type: typeNotInherited,
          }, false);
        });

      testTypeOrSupertypeFilter({
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: fileSupertypes[0],
          },
        },
      }, {
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'file',
          },
        },
      }, true);
      testTypeOrSupertypeFilter({
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'file',
          },
        },
      }, {
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'file',
          },
        },
      }, true);
      testTypeOrSupertypeFilter({
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'dataset',
          },
        },
      }, {
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'file',
          },
        },
      }, false);
    });

    context('when using "typeOrSubtype" filter', function () {
      it('returns true when there are no types defined', function () {
        const filters = [{
          filterType: 'typeOrSubtype',
          types: [],
        }];
        const atmDataSpec = {
          type: 'file',
        };

        expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.true;
      });

      it('returns true when at least one type matches', function () {
        const filters = [{
          filterType: 'typeOrSubtype',
          types: [{ type: 'dataset' }, { type: 'file' }],
        }];
        const atmDataSpec = {
          type: 'file',
        };

        expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.true;
      });

      it('returns false when none of types match', function () {
        const filters = [{
          filterType: 'typeOrSubtype',
          types: [{ type: 'dataset' }, { type: 'integer' }],
        }];
        const atmDataSpec = {
          type: 'file',
        };

        expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.false;
      });

      inheritanceRootTypes.forEach((atmDataSpecType) => {
        testTypeOrSubtypeFilter({
          type: atmDataSpecType,
        }, {
          type: atmDataSpecType,
        }, true);
        _.difference(atmDataSpecTypesArray, [atmDataSpecType])
          .forEach((filteredAtmDataSpecType) => {
            testTypeOrSubtypeFilter({
              type: atmDataSpecType,
            }, {
              type: filteredAtmDataSpecType,
            }, false);
          });
      });

      const fileTypeOrSupertypes = [
        'file',
        ...fileSupertypes,
      ];
      fileTypeOrSupertypes.forEach((fileTypeOrSupertype) => {
        testTypeOrSubtypeFilter({
          type: 'file',
        }, {
          type: fileTypeOrSupertype,
        }, true);
      });
      _.difference(atmDataSpecTypesArray, fileTypeOrSupertypes)
        .forEach((typeNotInheriting) => {
          testTypeOrSubtypeFilter({
            type: 'file',
          }, {
            type: typeNotInheriting,
          }, false);
        });
      atmFileTypesArray.forEach((atmFileType) => {
        testTypeOrSubtypeFilter({
          type: 'file',
          valueConstraints: {
            fileType: atmFileType,
          },
        }, {
          type: 'file',
          valueConstraints: {
            fileType: atmFileType,
          },
        }, true);
        atmFileTypeSubtypes[atmFileType].forEach((atmFileTypeSubtype) => {
          testTypeOrSubtypeFilter({
            type: 'file',
            valueConstraints: {
              fileType: atmFileTypeSubtype,
            },
          }, {
            type: 'file',
            valueConstraints: {
              fileType: atmFileType,
            },
          }, true);
        });
        _.difference(atmFileTypesArray, atmFileTypeSubtypes[atmFileType], [atmFileType])
          .forEach((invalidAtmFileTypeSubtype) => {
            testTypeOrSubtypeFilter({
              type: 'file',
              valueConstraints: {
                fileType: invalidAtmFileTypeSubtype,
              },
            }, {
              type: 'file',
              valueConstraints: {
                fileType: atmFileType,
              },
            }, false);
          });
      });

      const datasetTypeOrSupertypes = [
        'dataset',
        ...datasetSupertypes,
      ];
      datasetTypeOrSupertypes.forEach((datasetTypeOrSupertype) => {
        testTypeOrSubtypeFilter({
          type: 'dataset',
        }, {
          type: datasetTypeOrSupertype,
        }, true);
      });
      _.difference(atmDataSpecTypesArray, datasetTypeOrSupertypes)
        .forEach((typeNotInheriting) => {
          testTypeOrSubtypeFilter({
            type: 'dataset',
          }, {
            type: typeNotInheriting,
          }, false);
        });

      const rangeTypeOrSupertypes = [
        'range',
        ...rangeSupertypes,
      ];
      rangeTypeOrSupertypes.forEach((rangeTypeOrSupertype) => {
        testTypeOrSubtypeFilter({
          type: 'range',
        }, {
          type: rangeTypeOrSupertype,
        }, true);
      });
      _.difference(atmDataSpecTypesArray, rangeTypeOrSupertypes)
        .forEach((typeNotInheriting) => {
          testTypeOrSubtypeFilter({
            type: 'range',
          }, {
            type: typeNotInheriting,
          }, false);
        });

      const timeSeriesMeasurementTypeOrSupertypes = [
        'timeSeriesMeasurement',
        ...timeSeriesMeasurementSupertypes,
      ];
      timeSeriesMeasurementTypeOrSupertypes.forEach(
        (timeSeriesMeasurementTypeOrSupertype) => {
          testTypeOrSubtypeFilter({
            type: 'timeSeriesMeasurement',
          }, {
            type: timeSeriesMeasurementTypeOrSupertype,
          }, true);
        }
      );
      _.difference(atmDataSpecTypesArray, timeSeriesMeasurementTypeOrSupertypes)
        .forEach((typeNotInheriting) => {
          testTypeOrSubtypeFilter({
            type: 'timeSeriesMeasurement',
          }, {
            type: typeNotInheriting,
          }, false);
        });

      testTypeOrSubtypeFilter({
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: objectSubtypes[0],
          },
        },
      }, {
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'object',
          },
        },
      }, true);
      testTypeOrSubtypeFilter({
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'object',
          },
        },
      }, {
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'object',
          },
        },
      }, true);
      testTypeOrSubtypeFilter({
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'integer',
          },
        },
      }, {
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'object',
          },
        },
      }, false);
    });

    context('when using "forbiddenType" filter', function () {
      it('returns true when there are no types defined', function () {
        const filters = [{
          filterType: 'forbiddenType',
          types: [],
        }];
        const atmDataSpec = {
          type: 'file',
        };

        expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.true;
      });

      it('returns true when none of type match', function () {
        const filters = [{
          filterType: 'forbiddenType',
          types: [{ type: 'dataset' }, { type: 'integer' }],
        }];
        const atmDataSpec = {
          type: 'file',
        };

        expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.true;
      });

      it('returns false when at least one type matches', function () {
        const filters = [{
          filterType: 'forbiddenType',
          types: [{ type: 'dataset' }, { type: 'file' }],
        }];
        const atmDataSpec = {
          type: 'file',
        };

        expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.false;
      });

      inheritanceRootTypes.forEach((atmDataSpecType) => {
        testForbiddenTypeFilter({
          type: atmDataSpecType,
        }, {
          type: atmDataSpecType,
        }, false);
        _.difference(atmDataSpecTypesArray, [atmDataSpecType])
          .forEach((filteredAtmDataSpecType) => {
            testForbiddenTypeFilter({
              type: atmDataSpecType,
            }, {
              type: filteredAtmDataSpecType,
            }, true);
          });
      });

      const fileTypeOrSupertypes = [
        'file',
        ...fileSupertypes,
      ];
      fileTypeOrSupertypes.forEach((fileTypeOrSupertype) => {
        testForbiddenTypeFilter({
          type: 'file',
        }, {
          type: fileTypeOrSupertype,
        }, false);
      });
      _.difference(atmDataSpecTypesArray, fileTypeOrSupertypes)
        .forEach((typeNotInheriting) => {
          testForbiddenTypeFilter({
            type: 'file',
          }, {
            type: typeNotInheriting,
          }, true);
        });

      const datasetTypeOrSupertypes = [
        'dataset',
        ...datasetSupertypes,
      ];
      datasetTypeOrSupertypes.forEach((datasetTypeOrSupertype) => {
        testForbiddenTypeFilter({
          type: 'dataset',
        }, {
          type: datasetTypeOrSupertype,
        }, false);
      });
      _.difference(atmDataSpecTypesArray, datasetTypeOrSupertypes)
        .forEach((typeNotInheriting) => {
          testForbiddenTypeFilter({
            type: 'dataset',
          }, {
            type: typeNotInheriting,
          }, true);
        });

      const rangeTypeOrSupertypes = [
        'range',
        ...rangeSupertypes,
      ];
      rangeTypeOrSupertypes.forEach((rangeTypeOrSupertype) => {
        testForbiddenTypeFilter({
          type: 'range',
        }, {
          type: rangeTypeOrSupertype,
        }, false);
      });
      _.difference(atmDataSpecTypesArray, rangeTypeOrSupertypes)
        .forEach((typeNotInheriting) => {
          testForbiddenTypeFilter({
            type: 'range',
          }, {
            type: typeNotInheriting,
          }, true);
        });

      const timeSeriesMeasurementTypeOrSupertypes = [
        'timeSeriesMeasurement',
        ...timeSeriesMeasurementSupertypes,
      ];
      timeSeriesMeasurementTypeOrSupertypes.forEach(
        (timeSeriesMeasurementTypeOrSupertype) => {
          testForbiddenTypeFilter({
            type: 'timeSeriesMeasurement',
          }, {
            type: timeSeriesMeasurementTypeOrSupertype,
          }, false);
        }
      );
      _.difference(atmDataSpecTypesArray, timeSeriesMeasurementTypeOrSupertypes)
        .forEach((typeNotInheriting) => {
          testForbiddenTypeFilter({
            type: 'timeSeriesMeasurement',
          }, {
            type: typeNotInheriting,
          }, true);
        });

      testForbiddenTypeFilter({
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: objectSubtypes[0],
          },
        },
      }, {
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'object',
          },
        },
      }, false);
      testForbiddenTypeFilter({
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'object',
          },
        },
      }, {
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'object',
          },
        },
      }, false);
      testForbiddenTypeFilter({
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'integer',
          },
        },
      }, {
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'object',
          },
        },
      }, true);
      testForbiddenTypeFilter({
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'object',
          },
        },
      }, {
        type: 'object',
      }, false);
    });
  });

  describe('getMatchingAtmDataSpecTypes', function () {
    it('returns all types when there are no filters', function () {
      expect(getMatchingAtmDataSpecTypes([])).to.deep.equal(atmDataSpecTypesArray);
    });

    [
      ['integer', ['integer']],
      ['string', ['string']],
      ['object', ['object']],
      ['file', ['object', 'file']],
      ['dataset', ['object', 'dataset']],
      ['range', ['object', 'range']],
      ['array', ['array']],
      ['timeSeriesMeasurement', ['object', 'timeSeriesMeasurement']],
    ].forEach(([type, typeOrSupertypes]) => {
      it(`returns types matching typeOrSupertype filter with type ${type}`, function () {
        expect(getMatchingAtmDataSpecTypes([{
          filterType: 'typeOrSupertype',
          types: [{ type }],
        }])).to.deep.equal(typeOrSupertypes);
      });
    });

    it('returns types matching at least one type in typeOrSupertype filter', function () {
      expect(getMatchingAtmDataSpecTypes([{
        filterType: 'typeOrSupertype',
        types: [{ type: 'dataset' }, { type: 'file' }],
      }])).to.deep.equal(['object', 'file', 'dataset']);
    });

    [
      ['integer', ['integer']],
      ['string', ['string']],
      ['object', ['object', 'file', 'dataset', 'range', 'timeSeriesMeasurement']],
      ['file', ['file']],
      ['dataset', ['dataset']],
      ['range', ['range']],
      ['array', ['array']],
      ['timeSeriesMeasurement', ['timeSeriesMeasurement']],
    ].forEach(([type, typeOrSubtypes]) => {
      it(`returns types matching typeOrSubtype filter with type ${type}`, function () {
        expect(getMatchingAtmDataSpecTypes([{
          filterType: 'typeOrSubtype',
          types: [{ type }],
        }])).to.deep.equal(typeOrSubtypes);
      });
    });

    it('returns types matching at least one type in typeOrSubtype filter', function () {
      expect(getMatchingAtmDataSpecTypes([{
        filterType: 'typeOrSubtype',
        types: [{ type: 'dataset' }, { type: 'file' }],
      }])).to.deep.equal(['file', 'dataset']);
    });

    [
      ['integer', _.difference(atmDataSpecTypesArray, ['integer'])],
      ['string', _.difference(atmDataSpecTypesArray, ['string'])],
      ['object', _.difference(atmDataSpecTypesArray,
        ['object', 'file', 'dataset', 'range', 'timeSeriesMeasurement']
      )],
      ['file', _.difference(atmDataSpecTypesArray, ['file'])],
      ['dataset', _.difference(atmDataSpecTypesArray, ['dataset'])],
      ['range', _.difference(atmDataSpecTypesArray, ['range'])],
      ['array', _.difference(atmDataSpecTypesArray, ['array'])],
      ['timeSeriesMeasurement', _.difference(atmDataSpecTypesArray, ['timeSeriesMeasurement'])],
    ].forEach(([type, allowedTypes]) => {
      it(`returns types matching forbiddenType filter with type ${type}`, function () {
        expect(getMatchingAtmDataSpecTypes([{
          filterType: 'forbiddenType',
          types: [{ type }],
        }])).to.deep.equal(allowedTypes);
      });
    });

    it('returns types matching all types in forbiddenType filter', function () {
      expect(getMatchingAtmDataSpecTypes([{
        filterType: 'forbiddenType',
        types: [{ type: 'dataset' }, { type: 'file' }],
      }])).to.deep.equal(_.difference(atmDataSpecTypesArray, ['file', 'dataset']));
    });

    it('returns conditions matching many different filters', function () {
      expect(getMatchingAtmDataSpecTypes([{
        filterType: 'typeOrSubtype',
        types: [{ type: 'object' }],
      }, {
        filterType: 'forbiddenType',
        types: [{ type: 'file' }],
      }])).to.deep.equal(['object', ..._.difference(objectSubtypes, ['file'])]);
      expect(getMatchingAtmDataSpecTypes([{
        filterType: 'typeOrSupertype',
        types: [{ type: 'file' }],
      }, {
        filterType: 'forbiddenType',
        types: [{ type: 'file' }],
      }])).to.deep.equal(['object']);
    });
  });

  describe('getAtmValueConstraintsConditions', function () {
    _.difference(atmDataSpecTypesArray, ['array', 'file'])
      .forEach((atmDataSpecType) => {
        it(`returns null for type ${atmDataSpecType} regardless filters`, function () {
          [
            [],
            [{ filterType: 'typeOrSupertype', types: [{ type: 'dataset' }] }],
            [{ filterType: 'typeOrSubtype', types: [{ type: 'object' }] }],
            [{ filterType: 'forbiddenType', types: [{ type: 'object' }] }],
          ].forEach((filters) => {
            expect(getAtmValueConstraintsConditions(atmDataSpecType, filters)).to.be.null;
          });
        });
      });

    it('returns empty conditions for type array when filters are empty', function () {
      expect(getAtmValueConstraintsConditions('array', [])).to.deep.equal({
        itemDataSpecFilters: [],
      });
    });

    it('returns correct conditions for all types of filters', function () {
      const filters = [{
        filterType: 'typeOrSupertype',
        types: [{
          type: 'dataset',
        }, {
          type: 'array',
          valueConstraints: {
            itemDataSpec: {
              type: 'integer',
            },
          },
        }],
      }, {
        filterType: 'typeOrSubtype',
        types: [{
          type: 'file',
        }, {
          type: 'array',
          valueConstraints: {
            itemDataSpec: {
              type: 'string',
            },
          },
        }],
      }, {
        filterType: 'forbiddenType',
        types: [{
          type: 'range',
        }, {
          type: 'array',
          valueConstraints: {
            itemDataSpec: {
              type: 'file',
            },
          },
        }],
      }];
      expect(getAtmValueConstraintsConditions('array', filters)).to.deep.equal({
        itemDataSpecFilters: [{
          filterType: 'typeOrSupertype',
          types: [{
            type: 'integer',
          }],
        }, {
          filterType: 'typeOrSubtype',
          types: [{
            type: 'string',
          }],
        }, {
          filterType: 'forbiddenType',
          types: [{
            type: 'range',
          }, {
            type: 'array',
            valueConstraints: {
              itemDataSpec: {
                type: 'file',
              },
            },
          }, {
            type: 'file',
          }],
        }],
      });
    });

    it('returns conditions containing all possible file types for type file when filters are empty',
      function () {
        expect(getAtmValueConstraintsConditions('file', [])).to.deep.equal({
          allowedFileTypes: atmFileTypesArray,
        });
      }
    );

    it('returns conditions matching typeOrSupertype filter for type file', function () {
      expect(getAtmValueConstraintsConditions('file', [{
        filterType: 'typeOrSupertype',
        types: [{
          type: 'file',
          valueConstraints: {
            fileType: AtmFileType.Regular,
          },
        }, {
          type: 'file',
          valueConstraints: {
            fileType: AtmFileType.Directory,
          },
        }],
      }])).to.deep.equal({
        allowedFileTypes: [
          AtmFileType.Any,
          AtmFileType.Regular,
          AtmFileType.Directory,
        ],
      });
    });

    it('returns conditions matching typeOrSubtype filter for type file', function () {
      expect(getAtmValueConstraintsConditions('file', [{
        filterType: 'typeOrSubtype',
        types: [{
          type: 'file',
          valueConstraints: {
            fileType: AtmFileType.Regular,
          },
        }, {
          type: 'file',
          valueConstraints: {
            fileType: AtmFileType.Directory,
          },
        }],
      }])).to.deep.equal({
        allowedFileTypes: [
          AtmFileType.Regular,
          AtmFileType.Directory,
        ],
      });
      expect(getAtmValueConstraintsConditions('file', [{
        filterType: 'typeOrSubtype',
        types: [{
          type: 'file',
          valueConstraints: {
            fileType: AtmFileType.Any,
          },
        }, {
          type: 'file',
          valueConstraints: {
            fileType: AtmFileType.Directory,
          },
        }],
      }])).to.deep.equal({
        allowedFileTypes: atmFileTypesArray,
      });
    });

    it('returns conditions matching forbiddenType filter for type file', function () {
      expect(getAtmValueConstraintsConditions('file', [{
        filterType: 'forbiddenType',
        types: [{
          type: 'file',
          valueConstraints: {
            fileType: AtmFileType.Regular,
          },
        }, {
          type: 'file',
          valueConstraints: {
            fileType: AtmFileType.Directory,
          },
        }],
      }])).to.deep.equal({
        allowedFileTypes: [
          AtmFileType.Any,
          AtmFileType.SymbolicLink,
        ],
      });
      expect(getAtmValueConstraintsConditions('file', [{
        filterType: 'forbiddenType',
        types: [{
          type: 'file',
          valueConstraints: {
            fileType: AtmFileType.Any,
          },
        }],
      }])).to.deep.equal({
        allowedFileTypes: [],
      });
    });

    it('returns conditions matching many different filters for type file', function () {
      expect(getAtmValueConstraintsConditions('file', [{
        filterType: 'typeOrSubtype',
        types: [{
          type: 'file',
          valueConstraints: {
            fileType: AtmFileType.Any,
          },
        }],
      }, {
        filterType: 'forbiddenType',
        types: [{
          type: 'file',
          valueConstraints: {
            fileType: AtmFileType.SymbolicLink,
          },
        }],
      }])).to.deep.equal({
        allowedFileTypes: [
          AtmFileType.Any,
          AtmFileType.Regular,
          AtmFileType.Directory,
        ],
      });
      expect(getAtmValueConstraintsConditions('file', [{
        filterType: 'typeOrSupertype',
        types: [{
          type: 'file',
          valueConstraints: {
            fileType: AtmFileType.Regular,
          },
        }],
      }, {
        filterType: 'forbiddenType',
        types: [{
          type: 'file',
          valueConstraints: {
            fileType: AtmFileType.Regular,
          },
        }],
      }])).to.deep.equal({
        allowedFileTypes: [
          AtmFileType.Any,
        ],
      });
    });
  });
});
