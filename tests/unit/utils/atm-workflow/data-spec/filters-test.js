import { expect } from 'chai';
import { describe, it, context } from 'mocha';
import {
  isAtmDataSpecMatchingFilters,
  getMatchingAtmDataSpecTypes,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/filters';
import {
  AtmDataSpecType,
  atmDataSpecTypesArray,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import {
  atmFileTypesArray,
  atmFileTypeSupertypes,
  atmFileTypeSubtypes,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/types/file';
import _ from 'lodash';

const inheritanceLeafTypes = [
  AtmDataSpecType.Integer,
  AtmDataSpecType.Boolean,
  AtmDataSpecType.String,
  AtmDataSpecType.Array,
  AtmDataSpecType.File,
  AtmDataSpecType.Dataset,
  AtmDataSpecType.Range,
  AtmDataSpecType.TimeSeriesMeasurement,
];

const inheritanceRootTypes = [
  AtmDataSpecType.Integer,
  AtmDataSpecType.Boolean,
  AtmDataSpecType.String,
  AtmDataSpecType.Array,
  AtmDataSpecType.Object,
];

const fileSupertypes = [
  AtmDataSpecType.Object,
];
const datasetSupertypes = [
  AtmDataSpecType.Object,
];
const rangeSupertypes = [
  AtmDataSpecType.Object,
];
const timeSeriesMeasurementSupertypes = [
  AtmDataSpecType.Object,
];

const objectSubtypes = [
  AtmDataSpecType.File,
  AtmDataSpecType.Dataset,
  AtmDataSpecType.Range,
  AtmDataSpecType.TimeSeriesMeasurement,
];

describe('Unit | Utility | atm workflow/data spec/filters', function () {
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
        type: AtmDataSpecType.File,
      };

      expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.true;
    });

    it('returns true only when all filters are fulfilled', function () {
      const filters = [{
        filterType: 'typeOrSubtype',
        types: [{ type: AtmDataSpecType.Object }],
      }, {
        filterType: 'forbiddenType',
        types: [{ type: AtmDataSpecType.Dataset }],
      }];
      const atmDataSpec = {
        type: AtmDataSpecType.File,
      };

      expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.true;
    });

    it('returns false when one of filters is not fulfilled', function () {
      const filters = [{
        filterType: 'typeOrSubtype',
        types: [{ type: AtmDataSpecType.Object }],
      }, {
        filterType: 'forbiddenType',
        types: [{ type: AtmDataSpecType.Dataset }],
      }];
      const atmDataSpec = {
        type: AtmDataSpecType.Dataset,
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
          type: AtmDataSpecType.File,
        };

        expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.true;
      });

      it('returns true when at least one type matches', function () {
        const filters = [{
          filterType: 'typeOrSupertype',
          types: [{ type: AtmDataSpecType.Dataset }, { type: AtmDataSpecType.File }],
        }];
        const atmDataSpec = {
          type: AtmDataSpecType.File,
        };

        expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.true;
      });

      it('returns false when none of types match', function () {
        const filters = [{
          filterType: 'typeOrSupertype',
          types: [{ type: AtmDataSpecType.Dataset }, { type: AtmDataSpecType.Integer }],
        }];
        const atmDataSpec = {
          type: AtmDataSpecType.File,
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
          type: AtmDataSpecType.File,
          valueConstraints: {
            fileType: atmFileType,
          },
        }, {
          type: AtmDataSpecType.File,
          valueConstraints: {
            fileType: atmFileType,
          },
        }, true);
        atmFileTypeSupertypes[atmFileType].forEach((atmFileTypeSupertype) => {
          testTypeOrSupertypeFilter({
            type: AtmDataSpecType.File,
            valueConstraints: {
              fileType: atmFileTypeSupertype,
            },
          }, {
            type: AtmDataSpecType.File,
            valueConstraints: {
              fileType: atmFileType,
            },
          }, true);
        });
        _.difference(atmFileTypesArray, atmFileTypeSupertypes[atmFileType], [atmFileType])
          .forEach((invalidAtmFileTypeSupertype) => {
            testTypeOrSupertypeFilter({
              type: AtmDataSpecType.File,
              valueConstraints: {
                fileType: invalidAtmFileTypeSupertype,
              },
            }, {
              type: AtmDataSpecType.File,
              valueConstraints: {
                fileType: atmFileType,
              },
            }, false);
          });
      });

      const objectTypeOrSubtypes = [
        AtmDataSpecType.Object,
        ...objectSubtypes,
      ];
      objectTypeOrSubtypes.forEach((objectTypeOrSubtype) => {
        testTypeOrSupertypeFilter({
          type: AtmDataSpecType.Object,
        }, {
          type: objectTypeOrSubtype,
        }, true);
      });
      _.difference(atmDataSpecTypesArray, objectTypeOrSubtypes)
        .forEach((typeNotInherited) => {
          testTypeOrSupertypeFilter({
            type: AtmDataSpecType.Object,
          }, {
            type: typeNotInherited,
          }, false);
        });

      testTypeOrSupertypeFilter({
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: fileSupertypes[0],
          },
        },
      }, {
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: AtmDataSpecType.File,
          },
        },
      }, true);
      testTypeOrSupertypeFilter({
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: AtmDataSpecType.File,
          },
        },
      }, {
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: AtmDataSpecType.File,
          },
        },
      }, true);
      testTypeOrSupertypeFilter({
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: AtmDataSpecType.Dataset,
          },
        },
      }, {
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: AtmDataSpecType.File,
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
          type: AtmDataSpecType.File,
        };

        expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.true;
      });

      it('returns true when at least one type matches', function () {
        const filters = [{
          filterType: 'typeOrSubtype',
          types: [{ type: AtmDataSpecType.Dataset }, { type: AtmDataSpecType.File }],
        }];
        const atmDataSpec = {
          type: AtmDataSpecType.File,
        };

        expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.true;
      });

      it('returns false when none of types match', function () {
        const filters = [{
          filterType: 'typeOrSubtype',
          types: [{ type: AtmDataSpecType.Dataset }, { type: AtmDataSpecType.Integer }],
        }];
        const atmDataSpec = {
          type: AtmDataSpecType.File,
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
        AtmDataSpecType.File,
        ...fileSupertypes,
      ];
      fileTypeOrSupertypes.forEach((fileTypeOrSupertype) => {
        testTypeOrSubtypeFilter({
          type: AtmDataSpecType.File,
        }, {
          type: fileTypeOrSupertype,
        }, true);
      });
      _.difference(atmDataSpecTypesArray, fileTypeOrSupertypes)
        .forEach((typeNotInheriting) => {
          testTypeOrSubtypeFilter({
            type: AtmDataSpecType.File,
          }, {
            type: typeNotInheriting,
          }, false);
        });
      atmFileTypesArray.forEach((atmFileType) => {
        testTypeOrSubtypeFilter({
          type: AtmDataSpecType.File,
          valueConstraints: {
            fileType: atmFileType,
          },
        }, {
          type: AtmDataSpecType.File,
          valueConstraints: {
            fileType: atmFileType,
          },
        }, true);
        atmFileTypeSubtypes[atmFileType].forEach((atmFileTypeSubtype) => {
          testTypeOrSubtypeFilter({
            type: AtmDataSpecType.File,
            valueConstraints: {
              fileType: atmFileTypeSubtype,
            },
          }, {
            type: AtmDataSpecType.File,
            valueConstraints: {
              fileType: atmFileType,
            },
          }, true);
        });
        _.difference(atmFileTypesArray, atmFileTypeSubtypes[atmFileType], [atmFileType])
          .forEach((invalidAtmFileTypeSubtype) => {
            testTypeOrSubtypeFilter({
              type: AtmDataSpecType.File,
              valueConstraints: {
                fileType: invalidAtmFileTypeSubtype,
              },
            }, {
              type: AtmDataSpecType.File,
              valueConstraints: {
                fileType: atmFileType,
              },
            }, false);
          });
      });

      const datasetTypeOrSupertypes = [
        AtmDataSpecType.Dataset,
        ...datasetSupertypes,
      ];
      datasetTypeOrSupertypes.forEach((datasetTypeOrSupertype) => {
        testTypeOrSubtypeFilter({
          type: AtmDataSpecType.Dataset,
        }, {
          type: datasetTypeOrSupertype,
        }, true);
      });
      _.difference(atmDataSpecTypesArray, datasetTypeOrSupertypes)
        .forEach((typeNotInheriting) => {
          testTypeOrSubtypeFilter({
            type: AtmDataSpecType.Dataset,
          }, {
            type: typeNotInheriting,
          }, false);
        });

      const rangeTypeOrSupertypes = [
        AtmDataSpecType.Range,
        ...rangeSupertypes,
      ];
      rangeTypeOrSupertypes.forEach((rangeTypeOrSupertype) => {
        testTypeOrSubtypeFilter({
          type: AtmDataSpecType.Range,
        }, {
          type: rangeTypeOrSupertype,
        }, true);
      });
      _.difference(atmDataSpecTypesArray, rangeTypeOrSupertypes)
        .forEach((typeNotInheriting) => {
          testTypeOrSubtypeFilter({
            type: AtmDataSpecType.Range,
          }, {
            type: typeNotInheriting,
          }, false);
        });

      const timeSeriesMeasurementTypeOrSupertypes = [
        AtmDataSpecType.TimeSeriesMeasurement,
        ...timeSeriesMeasurementSupertypes,
      ];
      timeSeriesMeasurementTypeOrSupertypes.forEach(
        (timeSeriesMeasurementTypeOrSupertype) => {
          testTypeOrSubtypeFilter({
            type: AtmDataSpecType.TimeSeriesMeasurement,
          }, {
            type: timeSeriesMeasurementTypeOrSupertype,
          }, true);
        }
      );
      _.difference(atmDataSpecTypesArray, timeSeriesMeasurementTypeOrSupertypes)
        .forEach((typeNotInheriting) => {
          testTypeOrSubtypeFilter({
            type: AtmDataSpecType.TimeSeriesMeasurement,
          }, {
            type: typeNotInheriting,
          }, false);
        });

      testTypeOrSubtypeFilter({
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: objectSubtypes[0],
          },
        },
      }, {
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: AtmDataSpecType.Object,
          },
        },
      }, true);
      testTypeOrSubtypeFilter({
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: AtmDataSpecType.Object,
          },
        },
      }, {
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: AtmDataSpecType.Object,
          },
        },
      }, true);
      testTypeOrSubtypeFilter({
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: AtmDataSpecType.Integer,
          },
        },
      }, {
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: AtmDataSpecType.Object,
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
          type: AtmDataSpecType.File,
        };

        expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.true;
      });

      it('returns true when none of type match', function () {
        const filters = [{
          filterType: 'forbiddenType',
          types: [{ type: AtmDataSpecType.Dataset }, { type: AtmDataSpecType.Integer }],
        }];
        const atmDataSpec = {
          type: AtmDataSpecType.File,
        };

        expect(isAtmDataSpecMatchingFilters(atmDataSpec, filters)).to.be.true;
      });

      it('returns false when at least one type matches', function () {
        const filters = [{
          filterType: 'forbiddenType',
          types: [{ type: AtmDataSpecType.Dataset }, { type: AtmDataSpecType.File }],
        }];
        const atmDataSpec = {
          type: AtmDataSpecType.File,
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
        AtmDataSpecType.File,
        ...fileSupertypes,
      ];
      fileTypeOrSupertypes.forEach((fileTypeOrSupertype) => {
        testForbiddenTypeFilter({
          type: AtmDataSpecType.File,
        }, {
          type: fileTypeOrSupertype,
        }, false);
      });
      _.difference(atmDataSpecTypesArray, fileTypeOrSupertypes)
        .forEach((typeNotInheriting) => {
          testForbiddenTypeFilter({
            type: AtmDataSpecType.File,
          }, {
            type: typeNotInheriting,
          }, true);
        });

      const datasetTypeOrSupertypes = [
        AtmDataSpecType.Dataset,
        ...datasetSupertypes,
      ];
      datasetTypeOrSupertypes.forEach((datasetTypeOrSupertype) => {
        testForbiddenTypeFilter({
          type: AtmDataSpecType.Dataset,
        }, {
          type: datasetTypeOrSupertype,
        }, false);
      });
      _.difference(atmDataSpecTypesArray, datasetTypeOrSupertypes)
        .forEach((typeNotInheriting) => {
          testForbiddenTypeFilter({
            type: AtmDataSpecType.Dataset,
          }, {
            type: typeNotInheriting,
          }, true);
        });

      const rangeTypeOrSupertypes = [
        AtmDataSpecType.Range,
        ...rangeSupertypes,
      ];
      rangeTypeOrSupertypes.forEach((rangeTypeOrSupertype) => {
        testForbiddenTypeFilter({
          type: AtmDataSpecType.Range,
        }, {
          type: rangeTypeOrSupertype,
        }, false);
      });
      _.difference(atmDataSpecTypesArray, rangeTypeOrSupertypes)
        .forEach((typeNotInheriting) => {
          testForbiddenTypeFilter({
            type: AtmDataSpecType.Range,
          }, {
            type: typeNotInheriting,
          }, true);
        });

      const timeSeriesMeasurementTypeOrSupertypes = [
        AtmDataSpecType.TimeSeriesMeasurement,
        ...timeSeriesMeasurementSupertypes,
      ];
      timeSeriesMeasurementTypeOrSupertypes.forEach(
        (timeSeriesMeasurementTypeOrSupertype) => {
          testForbiddenTypeFilter({
            type: AtmDataSpecType.TimeSeriesMeasurement,
          }, {
            type: timeSeriesMeasurementTypeOrSupertype,
          }, false);
        }
      );
      _.difference(atmDataSpecTypesArray, timeSeriesMeasurementTypeOrSupertypes)
        .forEach((typeNotInheriting) => {
          testForbiddenTypeFilter({
            type: AtmDataSpecType.TimeSeriesMeasurement,
          }, {
            type: typeNotInheriting,
          }, true);
        });

      testForbiddenTypeFilter({
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: objectSubtypes[0],
          },
        },
      }, {
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: AtmDataSpecType.Object,
          },
        },
      }, false);
      testForbiddenTypeFilter({
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: AtmDataSpecType.Object,
          },
        },
      }, {
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: AtmDataSpecType.Object,
          },
        },
      }, false);
      testForbiddenTypeFilter({
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: AtmDataSpecType.Integer,
          },
        },
      }, {
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: AtmDataSpecType.Object,
          },
        },
      }, true);
      testForbiddenTypeFilter({
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: {
            type: AtmDataSpecType.Object,
          },
        },
      }, {
        type: AtmDataSpecType.Object,
      }, false);
    });
  });

  describe('getMatchingAtmDataSpecTypes', function () {
    it('returns all types when there are no filters', function () {
      expect(getMatchingAtmDataSpecTypes([])).to.deep.equal(atmDataSpecTypesArray);
    });

    [
      [AtmDataSpecType.Integer, [AtmDataSpecType.Integer]],
      [AtmDataSpecType.Boolean, [AtmDataSpecType.Boolean]],
      [AtmDataSpecType.String, [AtmDataSpecType.String]],
      [AtmDataSpecType.Object, [AtmDataSpecType.Object]],
      [AtmDataSpecType.File, [AtmDataSpecType.Object, AtmDataSpecType.File]],
      [AtmDataSpecType.Dataset, [AtmDataSpecType.Object, AtmDataSpecType.Dataset]],
      [AtmDataSpecType.Range, [AtmDataSpecType.Object, AtmDataSpecType.Range]],
      [AtmDataSpecType.Array, [AtmDataSpecType.Array]],
      [AtmDataSpecType.TimeSeriesMeasurement, [
        AtmDataSpecType.Object,
        AtmDataSpecType.TimeSeriesMeasurement,
      ]],
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
        types: [{ type: AtmDataSpecType.Dataset }, { type: AtmDataSpecType.File }],
      }])).to.deep.equal([
        AtmDataSpecType.Object,
        AtmDataSpecType.File,
        AtmDataSpecType.Dataset,
      ]);
    });

    [
      [AtmDataSpecType.Integer, [AtmDataSpecType.Integer]],
      [AtmDataSpecType.Boolean, [AtmDataSpecType.Boolean]],
      [AtmDataSpecType.String, [AtmDataSpecType.String]],
      [AtmDataSpecType.Object, [
        AtmDataSpecType.Object,
        AtmDataSpecType.File,
        AtmDataSpecType.Dataset,
        AtmDataSpecType.Range,
        AtmDataSpecType.TimeSeriesMeasurement,
      ]],
      [AtmDataSpecType.File, [AtmDataSpecType.File]],
      [AtmDataSpecType.Dataset, [AtmDataSpecType.Dataset]],
      [AtmDataSpecType.Range, [AtmDataSpecType.Range]],
      [AtmDataSpecType.Array, [AtmDataSpecType.Array]],
      [AtmDataSpecType.TimeSeriesMeasurement, [AtmDataSpecType.TimeSeriesMeasurement]],
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
        types: [{ type: AtmDataSpecType.Dataset }, { type: AtmDataSpecType.File }],
      }])).to.deep.equal([AtmDataSpecType.File, AtmDataSpecType.Dataset]);
    });

    [
      [AtmDataSpecType.Integer, _.difference(atmDataSpecTypesArray, [
        AtmDataSpecType.Integer,
      ])],
      [AtmDataSpecType.Boolean, _.difference(atmDataSpecTypesArray, [
        AtmDataSpecType.Boolean,
      ])],
      [AtmDataSpecType.String, _.difference(atmDataSpecTypesArray, [
        AtmDataSpecType.String,
      ])],
      [AtmDataSpecType.Object, _.difference(atmDataSpecTypesArray, [
        AtmDataSpecType.Object,
        AtmDataSpecType.File,
        AtmDataSpecType.Dataset,
        AtmDataSpecType.Range,
        AtmDataSpecType.TimeSeriesMeasurement,
      ])],
      [AtmDataSpecType.File, _.difference(atmDataSpecTypesArray, [
        AtmDataSpecType.File,
      ])],
      [AtmDataSpecType.Dataset, _.difference(atmDataSpecTypesArray, [
        AtmDataSpecType.Dataset,
      ])],
      [AtmDataSpecType.Range, _.difference(atmDataSpecTypesArray, [
        AtmDataSpecType.Range,
      ])],
      [AtmDataSpecType.Array, _.difference(atmDataSpecTypesArray, [
        AtmDataSpecType.Array,
      ])],
      [AtmDataSpecType.TimeSeriesMeasurement, _.difference(atmDataSpecTypesArray, [
        AtmDataSpecType.TimeSeriesMeasurement,
      ])],
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
        types: [{ type: AtmDataSpecType.Dataset }, { type: AtmDataSpecType.File }],
      }])).to.deep.equal(_.difference(atmDataSpecTypesArray, [
        AtmDataSpecType.File,
        AtmDataSpecType.Dataset,
      ]));
    });

    it('returns conditions matching many different filters', function () {
      expect(getMatchingAtmDataSpecTypes([{
        filterType: 'typeOrSubtype',
        types: [{ type: AtmDataSpecType.Object }],
      }, {
        filterType: 'forbiddenType',
        types: [{ type: AtmDataSpecType.File }],
      }]), 'typeOrSubtype and forbiddenType').to.deep.equal(
        [AtmDataSpecType.Object, ..._.difference(objectSubtypes, [
          AtmDataSpecType.File,
        ])]
      );
      expect(getMatchingAtmDataSpecTypes([{
        filterType: 'typeOrSupertype',
        types: [{ type: AtmDataSpecType.File }],
      }, {
        filterType: 'forbiddenType',
        types: [{ type: AtmDataSpecType.File }],
      }]), 'typeOrSupertype and forbiddenType').to.deep.equal([
        AtmDataSpecType.Object,
      ]);
    });
  });
});
