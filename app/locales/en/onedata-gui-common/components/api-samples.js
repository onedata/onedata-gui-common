export default {
  operation: 'Operation',
  type: 'Type',
  description: 'Description',
  command: 'Command example',
  envVariables: 'Environment variables',
  variablesTooltip: 'Environment variables required by the command example which have to be defined in your shell/script before usage.',
  apiType: {
    rest: 'REST',
    xrootd: 'XRootD',
  },
  apiCommandTipIntro: {
    rest: {
      oneprovider: 'The Oneprovider\'s REST API can be used to perform all data access and management related operations on files and directories.',
      public: 'The Onezone\'s public REST API can be used to access information and contents of all shared files and directories, without any authentication. It redirects to the corresponding REST API in one of the supporting Oneproviders. The Oneprovider is chosen dynamically and may change in time, so the redirection URL should not be cached.',
      onezone: 'The Onezone\'s REST API can be used to access information and contents of space.',
    },
    xrootdPublic: 'This environment offers an XRootD server that exposes all Open Data collections (shared files and directories that had been registered under a handle) for public, read-only access. Below are some basic XRootD commands that can be used to browse and download the data, assuming that the XRootD CLI tools are already installed.',
  },
  apiCommandTipLinkName: {
    rest: 'REST API',
    xrootd: 'XRootD',
  },
  apiOptionalParameters: 'This endpoint supports optional parameter(s):',
  coverIn: 'covered in',
  documentation: 'the documentation',
  variable: 'Variable',
  authorizationTokenDescription: 'Access token valid for accessing the Oneprovider REST API. In order to acquire one, visit',
  tokenPage: 'the TOKENS tab',
};
