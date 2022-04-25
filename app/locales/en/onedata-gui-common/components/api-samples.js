export default {
  operation: 'Operation',
  type: 'Type',
  description: 'Description',
  command: 'Command example',
  apiType: {
    rest: 'REST',
    xrootd: 'XRootD',
  },
  apiCommandTipIntro: {
    rest: 'The Onezone\'s public REST API can be used to access information and contents of all shared files and directories, without any authentication. It redirects to the corresponding REST API in one of the supporting Oneproviders. The Oneprovider is chosen dynamically and may change in time, so the redirection URL should not be cached.',
    xrootd: 'This environment offers an XRootD server that exposes all Open Data collections (shared files and directories that had been registered under a handle) for public, read-only access. Below are some basic XRootD commands that can be used to browse and download the data, assuming that the XRootD CLI tools are already installed.',
  },
  apiCommandTipLinkName: {
    rest: 'REST API',
    xrootd: 'XRootD',
  },
};
