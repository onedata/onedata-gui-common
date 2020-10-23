// /**
//  * Generates CURL command, which would perform a query equivalent to the active query parameters
//  * (conditions, sorting, etc.).
//  * 
//  * @module components/query-builder/curl-generator
//  * @author Michał Borzęcki
//  * @copyright (C) 2020 ACK CYFRONET AGH
//  * @license This software is released under the MIT license cited in 'LICENSE.txt'.
//  */

// import Component from '@ember/component';
// import { action } from '@ember/object';
// import { computed } from '@ember/object';
// import { resolve } from 'rsvp';
// import ElasticsearchQueryBuilder from 'harvester-gui-plugin-generic/utils/elasticsearch-query-builder';

// export default Component.extend({
//       {
//         /**
//          * @type {String}
//          */
//         i18nPrefix: 'components.query-builder.curl-generator';

//         /**
//          * @type {Utils.ElasticsearchQueryBuilder}
//          */
//         queryBuilder = new ElasticsearchQueryBuilder();

//         /**
//          * @type {Promise<String>}
//          */
//         @tracked curlPromise = resolve();

//         /**
//          * @type {boolean}
//          */
//         @tracked isCurlModalVisible = false;

//         /**
//          * @type {Function}
//          * @param {Object} query
//          * @returns {Promise<String>}
//          */
//         get onGenerateCurl() {
//           return this.args.onGenerateCurl || resolve;
//         }

//         /**
//          * @type {Utils.QueryBuilder.RootOperatorQueryBlock}
//          */
//         get rootQueryBlock() {
//           return this.args.rootQueryBlock || null;
//         }

//         /**
//          * @type {Object}
//          */
//         get filteredProperties() {
//           return this.args.filteredProperties || null;
//         }

//         /**
//          * @type {Utils.IndexProperty}
//          */
//         get sortProperty() {
//           return this.args.sortProperty || null;
//         }

//         /**
//          * @type {String}
//          */
//         get sortDirection() {
//           return this.args.sortDirection || null;
//         }

//         @action
//         openCurlModal() {
//           this.regenerateCurl();
//           this.isCurlModalVisible = true;
//         }

//         @action
//         closeCurlModal() {
//           this.isCurlModalVisible = false;
//         }

//         regenerateCurl() {
//           this.queryBuilder.mainQueryBlock =
//             this.rootQueryBlock && this.rootQueryBlock.operands[0];
//           this.queryBuilder.visibleContent = this.filteredProperties;
//           this.queryBuilder.sortProperty = this.sortProperty;
//           this.queryBuilder.sortDirection = this.sortDirection;
//           this.curlPromise = this.onGenerateCurl(this.queryBuilder.buildQuery());
//         }
//       }
