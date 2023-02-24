import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  AtmDataSpecType,
  atmDataSpecTypesArray,
  getAtmValueConstraintsConditions,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import {
  AtmFileType,
  atmFileTypesArray,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/types/file';
import _ from 'lodash';

describe('Unit | Utility | atm-workflow/data-spec/types', function () {
  describe('getAtmValueConstraintsConditions', function () {
    _.difference(
      atmDataSpecTypesArray,
      [AtmDataSpecType.Array, AtmDataSpecType.File, AtmDataSpecType.Number]
    ).forEach((atmDataSpecType) => {
      it(`returns null for type ${atmDataSpecType} regardless filters`, function () {
        [
          [],
          [{ filterType: 'typeOrSupertype', types: [{ type: AtmDataSpecType.Dataset }] }],
          [{ filterType: 'typeOrSubtype', types: [{ type: AtmDataSpecType.Object }] }],
          [{ filterType: 'forbiddenType', types: [{ type: AtmDataSpecType.Object }] }],
        ].forEach((filters) => {
          expect(getAtmValueConstraintsConditions(atmDataSpecType, filters)).to.be.null;
        });
      });
    });

    it('returns empty conditions for type array when filters are empty', function () {
      expect(getAtmValueConstraintsConditions(AtmDataSpecType.Array, [])).to.deep.equal({
        itemDataSpecFilters: [],
      });
    });

    it('returns correct conditions for all types of filters', function () {
      const filters = [{
        filterType: 'typeOrSupertype',
        types: [{
          type: AtmDataSpecType.Dataset,
        }, {
          type: AtmDataSpecType.Array,
          valueConstraints: {
            itemDataSpec: {
              type: AtmDataSpecType.Number,
            },
          },
        }],
      }, {
        filterType: 'typeOrSubtype',
        types: [{
          type: AtmDataSpecType.File,
        }, {
          type: AtmDataSpecType.Array,
          valueConstraints: {
            itemDataSpec: {
              type: AtmDataSpecType.String,
            },
          },
        }],
      }, {
        filterType: 'forbiddenType',
        types: [{
          type: AtmDataSpecType.Range,
        }, {
          type: AtmDataSpecType.Array,
          valueConstraints: {
            itemDataSpec: {
              type: AtmDataSpecType.File,
            },
          },
        }],
      }];
      expect(getAtmValueConstraintsConditions(AtmDataSpecType.Array, filters))
        .to.deep.equal({
          itemDataSpecFilters: [{
            filterType: 'typeOrSupertype',
            types: [{
              type: AtmDataSpecType.Number,
            }],
          }, {
            filterType: 'typeOrSubtype',
            types: [{
              type: AtmDataSpecType.String,
            }],
          }, {
            filterType: 'forbiddenType',
            types: [{
              type: AtmDataSpecType.Range,
            }, {
              type: AtmDataSpecType.Array,
              valueConstraints: {
                itemDataSpec: {
                  type: AtmDataSpecType.File,
                },
              },
            }, {
              type: AtmDataSpecType.File,
            }],
          }],
        });
    });

    it('returns conditions containing all possible integersOnly values for type number when filters are empty',
      function () {
        expect(getAtmValueConstraintsConditions(AtmDataSpecType.Number, []))
          .to.deep.equal({
            integersOnlyConstraintValues: [false, true],
          });
      }
    );

    it('returns conditions containing all possible integersOnly values for type number and typeOrSupertype filter without integersOnly constraint',
      function () {
        expect(getAtmValueConstraintsConditions(AtmDataSpecType.Number, [{
          filterType: 'typeOrSupertype',
          types: [{ type: AtmDataSpecType.Number }],
        }])).to.deep.equal({
          integersOnlyConstraintValues: [false],
        });
      }
    );

    it('returns conditions containing all possible integersOnly values for type number and typeOrSupertype filter with truthy integersOnly constraint',
      function () {
        expect(getAtmValueConstraintsConditions(AtmDataSpecType.Number, [{
          filterType: 'typeOrSupertype',
          types: [{
            type: AtmDataSpecType.Number,
            valueConstraints: {
              integersOnly: true,
            },
          }],
        }])).to.deep.equal({
          integersOnlyConstraintValues: [false, true],
        });
      }
    );

    it('returns conditions containing all possible integersOnly values for type number and typeOrSupertype filter with falsy integersOnly constraint',
      function () {
        expect(getAtmValueConstraintsConditions(AtmDataSpecType.Number, [{
          filterType: 'typeOrSupertype',
          types: [{
            type: AtmDataSpecType.Number,
            valueConstraints: {
              integersOnly: false,
            },
          }],
        }])).to.deep.equal({
          integersOnlyConstraintValues: [false],
        });
      }
    );

    it('returns conditions containing all possible integersOnly values for type number and typeOrSupertype filter with mixed integersOnly constraints',
      function () {
        expect(getAtmValueConstraintsConditions(AtmDataSpecType.Number, [{
          filterType: 'typeOrSupertype',
          types: [{
            type: AtmDataSpecType.Number,
            valueConstraints: {
              integersOnly: false,
            },
          }, {
            type: AtmDataSpecType.Number,
            valueConstraints: {
              integersOnly: true,
            },
          }],
        }])).to.deep.equal({
          integersOnlyConstraintValues: [false],
        });
      }
    );

    it('returns conditions containing all possible integersOnly values for type number and typeOrSubtype filter without integersOnly constraint',
      function () {
        expect(getAtmValueConstraintsConditions(AtmDataSpecType.Number, [{
          filterType: 'typeOrSubtype',
          types: [{ type: AtmDataSpecType.Number }],
        }])).to.deep.equal({
          integersOnlyConstraintValues: [false, true],
        });
      }
    );

    it('returns conditions containing all possible integersOnly values for type number and typeOrSubtype filter with truthy integersOnly constraint',
      function () {
        expect(getAtmValueConstraintsConditions(AtmDataSpecType.Number, [{
          filterType: 'typeOrSubtype',
          types: [{
            type: AtmDataSpecType.Number,
            valueConstraints: {
              integersOnly: true,
            },
          }],
        }])).to.deep.equal({
          integersOnlyConstraintValues: [true],
        });
      }
    );

    it('returns conditions containing all possible integersOnly values for type number and typeOrSubtype filter with falsy integersOnly constraint',
      function () {
        expect(getAtmValueConstraintsConditions(AtmDataSpecType.Number, [{
          filterType: 'typeOrSubtype',
          types: [{
            type: AtmDataSpecType.Number,
            valueConstraints: {
              integersOnly: false,
            },
          }],
        }])).to.deep.equal({
          integersOnlyConstraintValues: [false, true],
        });
      }
    );

    it('returns conditions containing all possible integersOnly values for type number and typeOrSubtype filter with mixed integersOnly constraints',
      function () {
        expect(getAtmValueConstraintsConditions(AtmDataSpecType.Number, [{
          filterType: 'typeOrSubtype',
          types: [{
            type: AtmDataSpecType.Number,
            valueConstraints: {
              integersOnly: false,
            },
          }, {
            type: AtmDataSpecType.Number,
            valueConstraints: {
              integersOnly: true,
            },
          }],
        }])).to.deep.equal({
          integersOnlyConstraintValues: [true],
        });
      }
    );

    it('returns conditions containing all possible integersOnly values for type number and mixed typeOrSubtype and typeOrSupertype filters',
      function () {
        [
          [false, false, [false]],
          [false, true, []],
          [true, false, [false, true]],
          [true, true, [true]],
        ].forEach(([integersOnlyForSupertype, integersOnlyForSubtype, result]) => {
          expect(getAtmValueConstraintsConditions(AtmDataSpecType.Number, [{
            filterType: 'typeOrSupertype',
            types: [{
              type: AtmDataSpecType.Number,
              valueConstraints: {
                integersOnly: integersOnlyForSupertype,
              },
            }],
          }, {
            filterType: 'typeOrSubtype',
            types: [{
              type: AtmDataSpecType.Number,
              valueConstraints: {
                integersOnly: integersOnlyForSubtype,
              },
            }],
          }])).to.deep.equal({
            integersOnlyConstraintValues: result,
          });
        });
      }
    );

    it('returns conditions containing all possible file types for type file when filters are empty',
      function () {
        expect(getAtmValueConstraintsConditions(AtmDataSpecType.File, [])).to.deep.equal({
          allowedFileTypes: atmFileTypesArray,
        });
      }
    );

    it('returns conditions containing all possible file types for typeOrSupertype filter with type file without value constraints',
      function () {
        expect(getAtmValueConstraintsConditions(AtmDataSpecType.File, [{
          filterType: 'typeOrSupertype',
          types: [{ type: AtmDataSpecType.File }],
        }])).to.deep.equal({
          allowedFileTypes: [AtmFileType.Any],
        });
      }
    );

    it('returns conditions matching typeOrSupertype filter for type file', function () {
      expect(getAtmValueConstraintsConditions(AtmDataSpecType.File, [{
        filterType: 'typeOrSupertype',
        types: [{
          type: AtmDataSpecType.File,
          valueConstraints: {
            fileType: AtmFileType.Regular,
          },
        }, {
          type: AtmDataSpecType.File,
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

    it('returns conditions containing all possible file types for typeOrSubtype filter with type file without value constraints',
      function () {
        expect(getAtmValueConstraintsConditions(AtmDataSpecType.File, [{
          filterType: 'typeOrSubtype',
          types: [{ type: AtmDataSpecType.File }],
        }])).to.deep.equal({
          allowedFileTypes: atmFileTypesArray,
        });
      }
    );

    it('returns conditions matching typeOrSubtype filter for type file', function () {
      expect(getAtmValueConstraintsConditions(AtmDataSpecType.File, [{
        filterType: 'typeOrSubtype',
        types: [{
          type: AtmDataSpecType.File,
          valueConstraints: {
            fileType: AtmFileType.Regular,
          },
        }, {
          type: AtmDataSpecType.File,
          valueConstraints: {
            fileType: AtmFileType.Directory,
          },
        }],
      }]), 'mixed typeOrSubtype of regular and directory').to.deep.equal({
        allowedFileTypes: [
          AtmFileType.Regular,
          AtmFileType.Directory,
        ],
      });
      expect(getAtmValueConstraintsConditions(AtmDataSpecType.File, [{
        filterType: 'typeOrSubtype',
        types: [{
          type: AtmDataSpecType.File,
          valueConstraints: {
            fileType: AtmFileType.Any,
          },
        }, {
          type: AtmDataSpecType.File,
          valueConstraints: {
            fileType: AtmFileType.Directory,
          },
        }],
      }]), 'mixed typeOrSubtype of any and directory').to.deep.equal({
        allowedFileTypes: atmFileTypesArray,
      });
    });

    it('returns conditions containing no file types for forbiddenType filter with type file without value constraints',
      function () {
        expect(getAtmValueConstraintsConditions(AtmDataSpecType.File, [{
          filterType: 'forbiddenType',
          types: [{ type: AtmDataSpecType.File }],
        }])).to.deep.equal({
          allowedFileTypes: [],
        });
      }
    );

    it('returns conditions matching forbiddenType filter for type file', function () {
      expect(getAtmValueConstraintsConditions(AtmDataSpecType.File, [{
        filterType: 'forbiddenType',
        types: [{
          type: AtmDataSpecType.File,
          valueConstraints: {
            fileType: AtmFileType.Regular,
          },
        }, {
          type: AtmDataSpecType.File,
          valueConstraints: {
            fileType: AtmFileType.Directory,
          },
        }],
      }]), 'mixed forbiddenType of regular and directory').to.deep.equal({
        allowedFileTypes: [
          AtmFileType.Any,
          AtmFileType.SymbolicLink,
        ],
      });
      expect(getAtmValueConstraintsConditions(AtmDataSpecType.File, [{
        filterType: 'forbiddenType',
        types: [{
          type: AtmDataSpecType.File,
          valueConstraints: {
            fileType: AtmFileType.Any,
          },
        }],
      }]), 'forbiddenType of any').to.deep.equal({
        allowedFileTypes: [],
      });
    });

    it('returns conditions matching many different filters for type file', function () {
      expect(getAtmValueConstraintsConditions(AtmDataSpecType.File, [{
          filterType: 'typeOrSubtype',
          types: [{
            type: AtmDataSpecType.File,
            valueConstraints: {
              fileType: AtmFileType.Any,
            },
          }],
        }, {
          filterType: 'forbiddenType',
          types: [{
            type: AtmDataSpecType.File,
            valueConstraints: {
              fileType: AtmFileType.SymbolicLink,
            },
          }],
        }]), 'mixed typeOrSubtype if any and forbiddenType of symbolic link')
        .to.deep.equal({
          allowedFileTypes: [
            AtmFileType.Any,
            AtmFileType.Regular,
            AtmFileType.Directory,
          ],
        });
      expect(getAtmValueConstraintsConditions(AtmDataSpecType.File, [{
          filterType: 'typeOrSupertype',
          types: [{
            type: AtmDataSpecType.File,
            valueConstraints: {
              fileType: AtmFileType.Regular,
            },
          }],
        }, {
          filterType: 'forbiddenType',
          types: [{
            type: AtmDataSpecType.File,
            valueConstraints: {
              fileType: AtmFileType.Regular,
            },
          }],
        }]), 'mixed typeOrSupertype if regular and forbiddenType of regular')
        .to.deep.equal({
          allowedFileTypes: [
            AtmFileType.Any,
          ],
        });
    });
  });
});
