import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  AtmDataSpecType,
  atmDataSpecTypesArray,
  getAtmDataSpecParamsConditions,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import {
  AtmFileType,
  atmFileTypesArray,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/types/file';
import _ from 'lodash';

describe('Unit | Utility | atm-workflow/data-spec/types', function () {
  describe('getAtmDataSpecParamsConditions', function () {
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
          expect(getAtmDataSpecParamsConditions(atmDataSpecType, filters)).to.be.null;
        });
      });
    });

    it('returns empty conditions for type array when filters are empty', function () {
      expect(getAtmDataSpecParamsConditions(AtmDataSpecType.Array, [])).to.deep.equal({
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
          itemDataSpec: {
            type: AtmDataSpecType.Number,
          },
        }],
      }, {
        filterType: 'typeOrSubtype',
        types: [{
          type: AtmDataSpecType.File,
        }, {
          type: AtmDataSpecType.Array,
          itemDataSpec: {
            type: AtmDataSpecType.String,
          },
        }],
      }, {
        filterType: 'forbiddenType',
        types: [{
          type: AtmDataSpecType.Range,
        }, {
          type: AtmDataSpecType.Array,
          itemDataSpec: {
            type: AtmDataSpecType.File,
          },
        }],
      }];
      expect(getAtmDataSpecParamsConditions(AtmDataSpecType.Array, filters))
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
              itemDataSpec: {
                type: AtmDataSpecType.File,
              },
            }, {
              type: AtmDataSpecType.File,
            }],
          }],
        });
    });

    it('returns conditions containing all possible integersOnly values for type number when filters are empty',
      function () {
        expect(getAtmDataSpecParamsConditions(AtmDataSpecType.Number, []))
          .to.deep.equal({
            integersOnlyParamValues: [false, true],
          });
      }
    );

    it('returns conditions containing narrowed selection of integersOnly values for type number and typeOrSupertype filter without integersOnly param',
      function () {
        expect(getAtmDataSpecParamsConditions(AtmDataSpecType.Number, [{
          filterType: 'typeOrSupertype',
          types: [{ type: AtmDataSpecType.Number }],
        }])).to.deep.equal({
          integersOnlyParamValues: [false],
        });
      }
    );

    it('returns conditions containing all possible integersOnly values for type number and typeOrSupertype filter with truthy integersOnly param',
      function () {
        expect(getAtmDataSpecParamsConditions(AtmDataSpecType.Number, [{
          filterType: 'typeOrSupertype',
          types: [{
            type: AtmDataSpecType.Number,
            integersOnly: true,
          }],
        }])).to.deep.equal({
          integersOnlyParamValues: [false, true],
        });
      }
    );

    it('returns conditions containing narrowed selection of integersOnly values for type number and typeOrSupertype filter with falsy integersOnly param',
      function () {
        expect(getAtmDataSpecParamsConditions(AtmDataSpecType.Number, [{
          filterType: 'typeOrSupertype',
          types: [{
            type: AtmDataSpecType.Number,
            integersOnly: false,
          }],
        }])).to.deep.equal({
          integersOnlyParamValues: [false],
        });
      }
    );

    it('returns conditions containing narrowed selection of integersOnly values for type number and typeOrSupertype filter with mixed integersOnly params',
      function () {
        expect(getAtmDataSpecParamsConditions(AtmDataSpecType.Number, [{
          filterType: 'typeOrSupertype',
          types: [{
            type: AtmDataSpecType.Number,
            integersOnly: false,
          }, {
            type: AtmDataSpecType.Number,
            integersOnly: true,
          }],
        }])).to.deep.equal({
          integersOnlyParamValues: [false],
        });
      }
    );

    it('returns conditions containing all possible integersOnly values for type number and typeOrSubtype filter without integersOnly param',
      function () {
        expect(getAtmDataSpecParamsConditions(AtmDataSpecType.Number, [{
          filterType: 'typeOrSubtype',
          types: [{ type: AtmDataSpecType.Number }],
        }])).to.deep.equal({
          integersOnlyParamValues: [false, true],
        });
      }
    );

    it('returns conditions containing narrowed selection of integersOnly values for type number and typeOrSubtype filter with truthy integersOnly param',
      function () {
        expect(getAtmDataSpecParamsConditions(AtmDataSpecType.Number, [{
          filterType: 'typeOrSubtype',
          types: [{
            type: AtmDataSpecType.Number,
            integersOnly: true,
          }],
        }])).to.deep.equal({
          integersOnlyParamValues: [true],
        });
      }
    );

    it('returns conditions containing all possible integersOnly values for type number and typeOrSubtype filter with falsy integersOnly param',
      function () {
        expect(getAtmDataSpecParamsConditions(AtmDataSpecType.Number, [{
          filterType: 'typeOrSubtype',
          types: [{
            type: AtmDataSpecType.Number,
            integersOnly: false,
          }],
        }])).to.deep.equal({
          integersOnlyParamValues: [false, true],
        });
      }
    );

    it('returns conditions containing narrowed selection of integersOnly values for type number and typeOrSubtype filter with mixed integersOnly params',
      function () {
        expect(getAtmDataSpecParamsConditions(AtmDataSpecType.Number, [{
          filterType: 'typeOrSubtype',
          types: [{
            type: AtmDataSpecType.Number,
            integersOnly: false,
          }, {
            type: AtmDataSpecType.Number,
            integersOnly: true,
          }],
        }])).to.deep.equal({
          integersOnlyParamValues: [true],
        });
      }
    );

    it('returns conditions containing only valid integersOnly values for type number and mixed typeOrSubtype and typeOrSupertype filters',
      function () {
        [
          [false, false, [false]],
          [false, true, []],
          [true, false, [false, true]],
          [true, true, [true]],
        ].forEach(([integersOnlyForSupertype, integersOnlyForSubtype, result]) => {
          expect(getAtmDataSpecParamsConditions(AtmDataSpecType.Number, [{
            filterType: 'typeOrSupertype',
            types: [{
              type: AtmDataSpecType.Number,
              integersOnly: integersOnlyForSupertype,
            }],
          }, {
            filterType: 'typeOrSubtype',
            types: [{
              type: AtmDataSpecType.Number,
              integersOnly: integersOnlyForSubtype,
            }],
          }])).to.deep.equal({
            integersOnlyParamValues: result,
          });
        });
      }
    );

    it('returns conditions containing all possible file types for type file when filters are empty',
      function () {
        expect(getAtmDataSpecParamsConditions(AtmDataSpecType.File, [])).to.deep.equal({
          allowedFileTypes: atmFileTypesArray,
        });
      }
    );

    it('returns conditions containing narrowed selection of file types for typeOrSupertype filter with type file without data spec params',
      function () {
        expect(getAtmDataSpecParamsConditions(AtmDataSpecType.File, [{
          filterType: 'typeOrSupertype',
          types: [{ type: AtmDataSpecType.File }],
        }])).to.deep.equal({
          allowedFileTypes: [AtmFileType.Any],
        });
      }
    );

    it('returns conditions matching typeOrSupertype filter for type file', function () {
      expect(getAtmDataSpecParamsConditions(AtmDataSpecType.File, [{
        filterType: 'typeOrSupertype',
        types: [{
          type: AtmDataSpecType.File,
          fileType: AtmFileType.Regular,
        }, {
          type: AtmDataSpecType.File,
          fileType: AtmFileType.Directory,
        }],
      }])).to.deep.equal({
        allowedFileTypes: [
          AtmFileType.Any,
          AtmFileType.Regular,
          AtmFileType.Directory,
        ],
      });
    });

    it('returns conditions containing all possible file types for typeOrSubtype filter with type file without data spec params',
      function () {
        expect(getAtmDataSpecParamsConditions(AtmDataSpecType.File, [{
          filterType: 'typeOrSubtype',
          types: [{ type: AtmDataSpecType.File }],
        }])).to.deep.equal({
          allowedFileTypes: atmFileTypesArray,
        });
      }
    );

    it('returns conditions matching typeOrSubtype filter for type file', function () {
      expect(getAtmDataSpecParamsConditions(AtmDataSpecType.File, [{
        filterType: 'typeOrSubtype',
        types: [{
          type: AtmDataSpecType.File,
          fileType: AtmFileType.Regular,
        }, {
          type: AtmDataSpecType.File,
          fileType: AtmFileType.Directory,
        }],
      }]), 'mixed typeOrSubtype of regular and directory').to.deep.equal({
        allowedFileTypes: [
          AtmFileType.Regular,
          AtmFileType.Directory,
        ],
      });
      expect(getAtmDataSpecParamsConditions(AtmDataSpecType.File, [{
        filterType: 'typeOrSubtype',
        types: [{
          type: AtmDataSpecType.File,
          fileType: AtmFileType.Any,
        }, {
          type: AtmDataSpecType.File,
          fileType: AtmFileType.Directory,
        }],
      }]), 'mixed typeOrSubtype of any and directory').to.deep.equal({
        allowedFileTypes: atmFileTypesArray,
      });
    });

    it('returns conditions containing no file types for forbiddenType filter with type file without data spec params',
      function () {
        expect(getAtmDataSpecParamsConditions(AtmDataSpecType.File, [{
          filterType: 'forbiddenType',
          types: [{ type: AtmDataSpecType.File }],
        }])).to.deep.equal({
          allowedFileTypes: [],
        });
      }
    );

    it('returns conditions matching forbiddenType filter for type file', function () {
      expect(getAtmDataSpecParamsConditions(AtmDataSpecType.File, [{
        filterType: 'forbiddenType',
        types: [{
          type: AtmDataSpecType.File,
          fileType: AtmFileType.Regular,
        }, {
          type: AtmDataSpecType.File,
          fileType: AtmFileType.Directory,
        }],
      }]), 'mixed forbiddenType of regular and directory').to.deep.equal({
        allowedFileTypes: [
          AtmFileType.Any,
          AtmFileType.SymbolicLink,
        ],
      });
      expect(getAtmDataSpecParamsConditions(AtmDataSpecType.File, [{
        filterType: 'forbiddenType',
        types: [{
          type: AtmDataSpecType.File,
          fileType: AtmFileType.Any,
        }],
      }]), 'forbiddenType of any').to.deep.equal({
        allowedFileTypes: [],
      });
    });

    it('returns conditions matching many different filters for type file', function () {
      expect(getAtmDataSpecParamsConditions(AtmDataSpecType.File, [{
          filterType: 'typeOrSubtype',
          types: [{
            type: AtmDataSpecType.File,
            fileType: AtmFileType.Any,
          }],
        }, {
          filterType: 'forbiddenType',
          types: [{
            type: AtmDataSpecType.File,
            fileType: AtmFileType.SymbolicLink,
          }],
        }]), 'mixed typeOrSubtype if any and forbiddenType of symbolic link')
        .to.deep.equal({
          allowedFileTypes: [
            AtmFileType.Any,
            AtmFileType.Regular,
            AtmFileType.Directory,
          ],
        });
      expect(getAtmDataSpecParamsConditions(AtmDataSpecType.File, [{
          filterType: 'typeOrSupertype',
          types: [{
            type: AtmDataSpecType.File,
            fileType: AtmFileType.Regular,
          }],
        }, {
          filterType: 'forbiddenType',
          types: [{
            type: AtmDataSpecType.File,
            fileType: AtmFileType.Regular,
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
