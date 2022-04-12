import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { camelize } from '@ember/string';
import $ from 'jquery';

describe('Integration | Component | record icon', function () {
  setupRenderingTest();

  it('has class "record-icon"', async function () {
    await render(hbs `{{record-icon}}`);

    expect(findAll('.record-icon')).to.have.length(1);
  });

  [{
    modelName: 'cluster',
    icon: 'cluster',
  }, {
    modelName: 'group',
    icon: 'group',
  }, {
    modelName: 'harvester',
    icon: 'light-bulb',
  }, {
    modelName: 'provider',
    icon: 'provider',
  }, {
    modelName: 'share',
    icon: 'browser-share',
  }, {
    modelName: 'space',
    icon: 'space',
  }, {
    modelName: 'user',
    icon: 'user',
  }, {
    modelName: 'token',
    icon: 'tokens',
  }, {
    modelName: 'atmInventory',
    icon: 'atm-inventory',
  }].forEach(({ modelName, icon }) => {
    it(
      `shows "${icon}" when passed record is an instance of "${modelName}" model`,
      async function () {
        this.set('record', {
          constructor: {
            modelName,
          },
        });

        await render(hbs `{{record-icon record=record}}`);

        expect($(find('.record-icon'))).to.have.class(`oneicon-${icon}`);
      }
    );

    it(
      `shows "${icon}" when passed modelName is "${modelName}"`,
      async function () {
        this.set('modelName', modelName);

        await render(hbs `{{record-icon modelName=modelName}}`);

        expect($(find('.record-icon'))).to.have.class(`oneicon-${icon}`);
      }
    );

    const camelizedModelName = camelize(modelName);
    if (camelizedModelName !== modelName) {
      it(
        `shows "${icon}" when passed modelName is "${camelizedModelName}"`,
        async function () {
          this.set('modelName', modelName);

          await render(hbs `{{record-icon modelName=modelName}}`);

          expect($(find('.record-icon'))).to.have.class(`oneicon-${icon}`);
        }
      );
    }
  });

  [{
    modelName: 'cluster',
    subtypes: [{
      properties: {
        type: 'oneprovider',
      },
      icon: 'provider',
    }, {
      properties: {
        type: 'onezone',
      },
      icon: 'onezone',
    }, {
      properties: {},
      icon: 'cluster',
    }],
  }, {
    modelName: 'group',
    subtypes: [{
      properties: {
        type: 'organization',
      },
      icon: 'organization',
    }, {
      properties: {
        type: 'unit',
      },
      icon: 'unit',
    }, {
      properties: {
        type: 'team',
      },
      icon: 'team',
    }, {
      properties: {
        type: 'role_holders',
      },
      icon: 'role-holders',
    }, {
      properties: {},
      icon: 'group',
    }],
  }, {
    modelName: 'harvester',
    subtypes: [{
      properties: {},
      icon: 'light-bulb',
    }],
  }, {
    modelName: 'provider',
    subtypes: [{
      properties: {},
      icon: 'provider',
    }],
  }, {
    modelName: 'share',
    subtypes: [{
      properties: {
        fileType: 'file',
      },
      icon: 'browser-file',
    }, {
      properties: {
        fileType: 'dir',
      },
      icon: 'browser-directory',
    }, {
      properties: {
        fileType: 'directory',
      },
      icon: 'browser-directory',
    }, {
      properties: {},
      icon: 'browser-share',
    }],
  }, {
    modelName: 'space',
    subtypes: [{
      properties: {},
      icon: 'space',
    }],
  }, {
    modelName: 'user',
    subtypes: [{
      properties: {},
      icon: 'user',
    }],
  }, {
    modelName: 'token',
    subtypes: [{
      properties: {
        typeName: 'access',
      },
      icon: 'token-access',
    }, {
      properties: {
        typeName: 'identity',
      },
      icon: 'token-identity',
    }, {
      properties: {
        typeName: 'invite',
      },
      icon: 'token-invite',
    }, {
      properties: {},
      icon: 'tokens',
    }],
  }].forEach(({ modelName, subtypes }) => {
    subtypes.forEach(({ properties, icon }) => {
      it(
        `shows "${icon}" when passed record is an instance of "${modelName}" model with ${JSON.stringify(properties)} additional properties and useSubtypeIcon is true`,
        async function () {
          this.set('record', Object.assign({
            constructor: {
              modelName,
            },
          }, properties));

          await render(hbs `{{record-icon useSubtypeIcon=true record=record}}`);

          expect($(find('.record-icon'))).to.have.class(`oneicon-${icon}`);
        }
      );
    });
  });
});
