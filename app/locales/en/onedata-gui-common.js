import basicauthLoginForm from './onedata-gui-common/components/basicauth-login-form';
import loginBox from './onedata-gui-common/components/login-box';
import oneFormFields from './onedata-gui-common/components/one-form-fields';
import applicationError from './onedata-gui-common/components/application-error';
import providerPlace from './onedata-gui-common/components/provider-place';
import providersList from './onedata-gui-common/components/providers-list';
import contentUsers from './onedata-gui-common/components/content-users';
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

import login from './onedata-gui-common/routes/login';

import guiUtils from './onedata-gui-common/services/gui-utils';

const translations = {
  components: {
    basicauthLoginForm,
    loginBox,
    oneFormFields,
    applicationError,
    providerPlace,
    providersList,
    contentUsers,
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
  },
  routes: {
    login,
  },
  services: {
    guiUtils,
  },
};

export default translations;
