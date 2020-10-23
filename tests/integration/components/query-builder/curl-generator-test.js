// import { expect } from 'chai';
// import { describe, it } from 'mocha';
// import { setupRenderingTest } from 'ember-mocha';
// import { render } from '@ember/test-helpers';
// import hbs from 'htmlbars-inline-precompile';
// import { click, settled } from '@ember/test-helpers';
// import sinon from 'sinon';
// import { Promise } from 'rsvp';
// import RootOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/root-operator-query-block';
// import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';

// describe('Integration | Component | query-builder/curl-generator', function () {
//   setupRenderingTest();

//   it('renders trigger button', async function () {
//     await render(hbs `<QueryBuilder::CurlGenerator />`);

//     const trigger = this.element.querySelector('.generate-query-request');
//     expect(trigger).to.exist;
//     expect(trigger.textContent.trim()).to.equal('{ REST API }');
//   });

//   it('has hidden modal on init', async function () {
//     await render(hbs `<QueryBuilder::CurlGenerator />`);

//     expect(this.element.querySelector('.curl-generator-modal.show')).to.not.exist;
//   });

//   it('opens modal on trigger click', async function () {
//     await render(hbs `<QueryBuilder::CurlGenerator />`);
//     await click('.generate-query-request');

//     expect(this.element.querySelector('.curl-generator-modal.show')).to.exist;
//   });

//   it('allows to close modal', async function () {
//     await render(hbs `<QueryBuilder::CurlGenerator />`);
//     await click('.generate-query-request');
//     await click('.modal');

//     expect(this.element.querySelector('.curl-generator-modal.show')).to.not.exist;
//   });

//   it('allows to reopen modal', async function () {
//     await render(hbs `<QueryBuilder::CurlGenerator />`);
//     await click('.generate-query-request');
//     await click('.modal');
//     await click('.generate-query-request');

//     expect(this.element.querySelector('.curl-generator-modal.show')).to.exist;
//   });

//   it(
//     'does not load CURL request before trigger click',
//     async function () {
//       const generateCurlStub = this.set('generateCurlStub', sinon.stub());

//       await render(hbs `<QueryBuilder::CurlGenerator
//         @onGenerateCurl={{this.generateCurlStub}}
//       />`);

//       expect(generateCurlStub).to.not.be.called;
//     }
//   );

//   it('shows spinner when CURL request is being loaded', async function () {
//     this.set('generateCurlStub', () => new Promise(() => {}));

//     await render(hbs `<QueryBuilder::CurlGenerator
//       @onGenerateCurl={{this.generateCurlStub}}
//     />`);
//     await click('.generate-query-request');

//     expect(document.querySelector('.curl-generator-modal textarea')).to.not.exist;
//     expect(document.querySelector('.curl-generator-modal .spinner')).to.exist;
//   });

//   it('shows error when getting CURL request failed', async function () {
//     let rejectPromise;
//     this.set(
//       'generateCurlStub',
//       () => new Promise((resolve, reject) => rejectPromise = reject)
//     );

//     await render(hbs `<QueryBuilder::CurlGenerator
//       @onGenerateCurl={{this.generateCurlStub}}
//     />`);
//     await click('.generate-query-request');
//     rejectPromise('err');
//     await settled();

//     const errorContainer =
//       this.element.querySelector('.curl-generator-modal .error-container');
//     expect(errorContainer).to.exist;
//     expect(errorContainer.querySelector('.details-json').textContent.trim())
//       .to.equal('"err"');
//   });

//   [{
//     additionalAttrs: {},
//     additionalAttrsInQuery: {},
//     descriptionSuffix: '',
//   }, {
//     additionalAttrs: {
//       filteredProperties: {
//         a: {
//           b: {},
//         },
//         c: {},
//       },
//     },
//     additionalAttrsInQuery: {
//       _source: [
//         'a.b',
//         'c',
//       ],
//     },
//     descriptionSuffix: ' with filtered properties',
//   }, {
//     additionalAttrs: {
//       sortProperty: { path: 'a.b' },
//       sortDirection: 'asc',
//     },
//     additionalAttrsInQuery: {
//       sort: [{
//         'a.b': 'asc',
//       }],
//     },
//     descriptionSuffix: ' with custom sort',
//   }].forEach(({ additionalAttrs, additionalAttrsInQuery, descriptionSuffix }) => {
//     it(`shows CURL request${descriptionSuffix}`, async function () {
//       const rootQueryBlock = new RootOperatorQueryBlock();
//       rootQueryBlock.operands.pushObject(
//         new ConditionQueryBlock({ path: 'a.b' }, 'boolean.is', 'true')
//       );
//       const { generateCurlStub } = this.setProperties(Object.assign({
//         generateCurlStub: sinon.stub().resolves('curl!'),
//         rootQueryBlock,
//       }, additionalAttrs));

//       await render(hbs `<QueryBuilder::CurlGenerator
//         @onGenerateCurl={{this.generateCurlStub}}
//         @rootQueryBlock={{this.rootQueryBlock}}
//         @filteredProperties={{this.filteredProperties}}
//         @sortProperty={{this.sortProperty}}
//         @sortDirection={{this.sortDirection}}
//       />`);
//       await click('.generate-query-request');

//       expect(generateCurlStub).to.be.calledOnce;
//       expect(generateCurlStub.lastCall.args[0]).to.deep.equal(Object.assign({
//         from: 0,
//         size: 10,
//         sort: [{
//           _score: 'desc',
//         }],
//         query: {
//           bool: {
//             must: [{
//               term: {
//                 'a.b': {
//                   value: 'true',
//                 },
//               },
//             }],
//           },
//         },
//       }, additionalAttrsInQuery));

//       expect(document.querySelector('.curl-generator-modal .spinner')).to.not.exist;
//       expect(document.querySelector('.curl-generator-modal textarea'))
//         .to.have.value('curl!');
//     });
//   });
// });
