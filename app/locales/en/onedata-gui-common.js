import basicauthLoginForm from './onedata-gui-common/components/basicauth-login-form';
import alertGlobal from './onedata-gui-common/components/alert-global';
import loginBox from './onedata-gui-common/components/login-box';
import oneFormFields from './onedata-gui-common/components/one-form-fields';
import applicationError from './onedata-gui-common/components/application-error';
import providerPlace from './onedata-gui-common/components/provider-place';
import providersList from './onedata-gui-common/components/providers-list';
import supportSizeInfo from './onedata-gui-common/components/support-size-info';
import resourceLoadError from './onedata-gui-common/components/resource-load-error';
import oneInlineEditor from './onedata-gui-common/components/one-inline-editor';
import emptyCollectionSidebar from './onedata-gui-common/components/empty-collection-sidebar';
import oneTile from './onedata-gui-common/components/one-tile';
import resourceNotFound from './onedata-gui-common/components/resource-not-found';
import proceedProcessModal from './onedata-gui-common/components/proceed-process-modal';
import oneCopyButton from './onedata-gui-common/components/one-copy-button';
import oneWayToggle from './onedata-gui-common/components/one-way-toggle';
import oneSizeEdit from './onedata-gui-common/components/one-size-edit';
import clipboardLine from './onedata-gui-common/components/clipboard-line';
import authenticationErrorModal from './onedata-gui-common/components/authentication-error-modal';
import sidebarClusters from './onedata-gui-common/components/sidebar-clusters';
import providersMapTile from './onedata-gui-common/components/providers-map-tile';
import userAccountButton from './onedata-gui-common/components/user-account-button';
import jsonEditor from './onedata-gui-common/components/json-editor';
import endpointError from './onedata-gui-common/components/alerts/endpoint-error';
import brandInfo from './onedata-gui-common/components/brand-info';
import userCredentialsForm from './onedata-gui-common/components/user-credentials-form';
import loginLayout from './onedata-gui-common/components/login-layout';
import oneproviderMapCircle from './onedata-gui-common/components/oneprovider-map-circle';
import oneprovidersSelectorPopoverContent from './onedata-gui-common/components/oneproviders-selector-popover-content';
import oneSidebar from './onedata-gui-common/components/one-sidebar';
import formComponent from './onedata-gui-common/components/form-component';
import tagsInput from './onedata-gui-common/components/tags-input';
import contentSharesEmpty from './onedata-gui-common/components/content-shares-empty';
import qosParamsEditor from './onedata-gui-common/components/qos-params-editor';

import authenticationErrorMessage from './onedata-gui-common/mixins/authentication-error-message';
import autoSaveForm from './onedata-gui-common/mixins/components/auto-save-form';

import login from './onedata-gui-common/routes/login';

import globalNotify from './onedata-gui-common/services/global-notify';
import guiUtils from './onedata-gui-common/services/gui-utils';
import clusterActions from './onedata-gui-common/services/cluster-actions';

import backendErrors from './onedata-gui-common/errors/backend-errors';
import noPermissions from './onedata-gui-common/errors/no-permissions';
import noClusterPermissions from './onedata-gui-common/errors/no-cluster-permissions';
import cannotInitWebsocket from './onedata-gui-common/errors/cannot-init-websocket';

import json from './onedata-gui-common/validators/json';

const translations = {
  components: {
    basicauthLoginForm,
    alertGlobal,
    loginBox,
    oneFormFields,
    applicationError,
    providerPlace,
    providersList,
    supportSizeInfo,
    resourceLoadError,
    oneInlineEditor,
    emptyCollectionSidebar,
    oneTile,
    resourceNotFound,
    proceedProcessModal,
    oneCopyButton,
    oneWayToggle,
    oneSizeEdit,
    authenticationErrorModal,
    sidebarClusters,
    clipboardLine,
    providersMapTile,
    userAccountButton,
    brandInfo,
    jsonEditor,
    userCredentialsForm,
    loginLayout,
    oneproviderMapCircle,
    oneprovidersSelectorPopoverContent,
    oneSidebar,
    formComponent,
    tagsInput,
    contentSharesEmpty,
    qosParamsEditor,
    alerts: {
      endpointError,
    },
  },
  mixins: {
    authenticationErrorMessage,
    components: {
      autoSaveForm,
    },
  },
  routes: {
    login,
  },
  services: {
    globalNotify,
    guiUtils,
    clusterActions,
  },
  errors: {
    backendErrors,
    noPermissions,
    noClusterPermissions,
    cannotInitWebsocket,
  },
  validators: {
    json,
  },
};

export default translations;
