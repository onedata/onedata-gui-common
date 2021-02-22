// should be sychronized with:
// https://git.onedata.org/projects/VFS/repos/ctool/browse/src/errors.erl

export default {
  // General errors
  badMessage: 'Internal error: client message could not be understood by the server.',
  noConnectionToOnezone: 'No connection to Onezone service.',
  noConnectionToPeerOneprovider: 'Proxy error: no connection to peer Oneprovider.',
  noConnectionToClusterNode: 'No connection to cluster node.',
  unregisteredOneprovider: 'This Oneprovider is not registered.',
  internalServerError: 'The server has encountered an error while processing this request.',
  notImplemented: 'This operation is not implemented.',
  notSupported: 'This operation is not supported.',
  serviceUnavailable: 'Service required for this operation is offline.',
  timeout: 'Operation timed out – please try again later.',
  temporaryFailure: 'The server reported a temporary failure – please try again later.',
  externalServiceOperationFailed: 'Your request could not be fulfilled due to problems with the external service "{{serviceName}}". This might be a temporary problem or a misconfiguration. Please try again later or contact the site administrators if the problem persists.',
  unauthorized: 'You must authenticate yourself to perform this operation.',
  forbidden: 'You are not authorized to perform this operation (insufficient privileges?).',
  notFound: 'The resource could not be found.',
  alreadyExists: 'The resource already exists.',
  fileAccess: 'Cannot access file {{path}}: {{errno}}',

  // POSIX errors
  posix: '{{errno}}',

  // Auth errors
  badBasicCredentials: 'Invalid username or password.',
  badIdpAccessToken: 'Provided access token for {{idp}} is not valid.',
  badToken: 'Provided token could not be understood by the server.',
  badServiceToken: 'Provided service token is not valid – {{tokenError}}',
  badConsumerToken: 'Provided consumer token is not valid – {{tokenError}}',
  tokenInvalid: 'Provided token is not valid.',
  tokenRevoked: 'Provided token has been revoked.',
  tokenTooLarge: 'Provided token exceeds the allowed size of {{limit}} bytes.',
  notAnAccessToken: 'Expected an identity token, but received a(n) {{received}}.',
  notAnIdentityToken: 'Expected an access token, but received a(n) {{received}}.',
  notAnInviteToken: 'Expected a(n) {{expectedInviteType}} invitation token, but received a(n) {{received}}.',
  tokenCaveatUnknown: 'Unknown caveat – {{caveat}}.',
  tokenCaveatUnverified: 'Provided token is not valid – unverified {{caveat.type}} caveat. More details below.',
  tokenTimeCaveatRequired: 'You must specify a time caveat with maximum TTL of {{maxTtl}} seconds.',
  tokenSubjectInvalid: 'The token subject is invalid (does not exist or is different than expected).',
  tokenServiceForbidden: 'The service ({{service}}) is forbidden for this subject.',
  inviteTokenSubjectNotAuthorized: 'The subject (creator) of this token is not (or not longer) authorized to issue such invitations.',
  inviteTokenUsageLimitReached: 'The usage limit of this invite token has been reached.',
  inviteTokenConsumerInvalid: 'The consumer ({{consumer}}) is invalid for this type of invite token.',
  inviteTokenTargetIdInvalid: 'The target id ({{id}}) is invalid for this type of invite token.',
  tokenSessionInvalid: 'This token was issued for a session that no longer exists.',

  // Graph Sync errors
  expectedHandshakeMessage: 'Connection to the server was lost or not fully established (expected handshake message).',
  handshakeAlreadyDone: 'Tried to initialize connection to the server, but it was already established (handshake already done).',
  badVersion: 'Could not negotiate protocol version. Versions supported by the server: {{supportedVersions}}.',
  badGRI: 'Provided GRI (Graph Resource Identifier) is invalid.',
  rpcUndefined: 'Requested RPC operation is not defined.',
  notSubscribable: 'Malformed request (not subscribable).',

  // Data validation errors
  malformedData: 'Malformed request (malformed data).',
  missingRequiredValue: 'Required value of "{{key}}" is missing.',
  missingAtLeastOneValue: 'Missing data, you must provide at least one of: {{keys}}.',
  badData: 'Value of "{{key}}" provided in request is invalid{{endingWithHint}}',
  badValueEmpty: 'Value of "{{key}}" provided in request cannot be empty.',
  badValueBoolean: 'Value of "{{key}}" provided in request must be a boolean.',
  badValueString: 'Value of "{{key}}" provided in request must be a string.',
  badValueStringTooLarge: 'Value of "{{key}}" provided in request cannot be larger than {{limit}} characters.',
  badValueListOfStrings: 'Value of "{{key}}" provided in request must be a list of strings.',
  badValueInteger: 'Value of "{{key}}" provided in request must be an integer.',
  badValueFloat: 'Value of "{{key}}" provided in request must be a float.',
  badValueJSON: 'Value of "{{key}}" provided in request must be a JSON.',
  badValueToken: 'Value of "{{key}}" provided in request is not valid token – {{tokenError}}',
  badValueTokenType: 'Value of "{{key}}" provided in request must be a valid token type.',
  badValueInviteType: 'Value of "{{key}}" provided in request must be a valid invite type.',
  badValueIPv4Address: 'Value of "{{key}}" provided in request must be a valid IPv4 address.',
  badValueListOfIPv4Addresses: 'Value of "{{key}}" provided in request must be a list of valid IPv4 adresses.',
  badValueTooLow: 'Value of "{{key}}" provided in request must be greater or equal to {{limit}}.',
  badValueTooHigh: 'Value of "{{key}}" provided in request should be less or equal to {{limit}}.',
  badValueNotInRange: 'Value of "{{key}}" provided in request should be between {{low}} and {{high}}.',
  badValueNotAllowed: 'Value of "{{key}}" provided in request is not allowed, valid values: {{allowed}}.',
  badValueListNotAllowed: 'Value of "{{key}}" provided in request must be a list, allowed values: {{allowed}}.',
  badValueIdNotFound: 'Resource specified in "{{key}}" does not exist.',
  badValueAmbiguousId: 'The Id (key: {{key}}) is ambiguous.',
  badValueIdentifier: 'Value of "{{key}}" provided in request must be a valid identifier.',
  badValueIdentifierOccupied: 'The identifier provided for "{{key}}" is occupied.',
  badValueOctal: 'Value of "{{key}}" provided in request is not a valid octal number.',
  badValueFullName: 'Value provided in request must be a valid full name. More details below.',
  badValueUsername: 'Value provided in request must be a valid username. More details below.',
  badValuePassword: 'Value provided in request must be a valid password. More details below.',
  badValueEmail: 'Value provided in request must be a valid e-mail address.',
  badValueName: 'Value provided in request must be a valid name.',
  badValueDomain: 'Value provided in request must be a valid domain name.',
  badValueSubdomain: 'Value provided in request must be a valid subdomain name.',
  badValueCaveat: 'Provided caveats are invalid.',
  badValueQoSParameters: 'Provided QoS parameters are invalid.',
  badGuiPackage: 'Provider GUI package could not be understood by the server.',
  guiPackageTooLarge: 'Provider GUI package is too large.',
  guiPackageUnverified: 'GUI plugin package verification failed, because SHA checksum of uploaded package is not whitelisted. To allow uploading this package please contact Onezone administrator and ask to add harvester GUI checksum {{shaSum}} to /etc/oz_worker/compatibility.json configuration file.',
  invalidQosExpression: 'Invalid QoS expression.',
  illegalSupportStageTransition: 'Illegal support stage transition: this operation cannot be performed while the storage is in stage "{{currentStorageStage}}" and provider is in stage "{{currentProviderStage}}".',

  // State errors
  basicAuthNotSupported: 'Username & password sign-in is not supported by this Onezone.',
  basicAuthDisabled: 'Username & password sign-in is disabled for this user.',
  subdomainDelegationNotSupported: 'Subdomain delegation is not supported by this Onezone.',
  subdomainDelegationDisabled: 'This operation is not available as subdomain delegation is disabled for this Oneprovider.',
  protectedGroup: 'This group is protected and cannot be deleted',
  cannotRemoveLastOwner: 'Cannot remove the last owner – another owner must be assigned first. Ownership can be granted to any direct or effective member.',
  cannotDeleteEntity: 'Unexpected error while deleting the {{entityType}} (Id: "{{entityId}}").',
  cannotAddRelationToSelf: 'Cannot join group to itself.',
  relationDoesNotExist: 'The {{childType}} (Id: "{{childId}}") does not belong to the {{parentType}} (Id: {{parentId}}).',
  relationAlreadyExists: 'The {{childType}} (Id: "{{childId}}") already belongs to the {{parentType}} (Id: {{parentId}}).',
  spaceAlreadySupportedWithImportedStorage: 'Space (Id: "{{spaceId}}") is already supported with an imported storage (Id: "{{storageId}}").',

  // Op-worker errors
  userNotSupported: 'Authenticated user is not supported by this Oneprovider.',
  autoCleaningDisabled: 'Auto-cleaning is disabled.',
  filePopularityDisabled: 'File popularity is disabled.',
  spaceNotSupportedBy: 'Space is not supported by the Oneprovider (Id: {{providerId}}).',
  notALocalStorageSupportingSpace: 'Storage (ID: {{storageId}}) does not belong to this Oneprovider (ID: {{providerId}}) and/or does not support the space (ID: {{spaceId}}).',
  storageInUse: 'Specified storage supports a space.',
  requiresManualStorageImportMode: 'Operation requires space with manual storage import mode.',
  requiresAutoStorageImportMode: 'Operation requires space with auto storage import mode.',
  storageTestFailed: 'Failed to {{operation}} test file on storage.',
  requiresNonImportedStorage: 'Cannot apply for storage (ID: {{storageId}}) – this operation requires a non-imported storage.',
  requiresImportedStorage: 'Cannot apply for storage (ID: {{storageId}}) – this operation requires a non-imported storage.',
  requiresPosixCompatibleStorage: 'Cannot apply for storage (ID: {{storageId}}) – this operation requires a POSIX-compatible storage (any of: {{posixCompatibleStorages}}).',
  autoStorageImportNotSupported: 'Cannot configure auto storage import on storage (ID: {{storageId}}) – this operation requires any of: {{supportedStorages}} storage with canonical path type and on object storages (any of: {{supportedObjectStorages}}) it requires blockSize = 0.',
  fileRegistrationNotSupported: 'Cannot perform file registration on storage (ID: {{storageId}}) – this operation requires storage with canonical path type and on object storages (any of: {{objectStorages}}) it requires blockSize = 0.',
  statOperationNotSupported: 'Storage (ID: {{storageId}}) does not support the `stat` operation or equivalent used for acquiring files metadata.',
  transferAlreadyEnded: 'The transfer has already ended.',
  transferNotEnded: 'The transfer has not ended yet.',
  viewNotExistsOn: 'The database view does not exist on the Oneprovider (Id: {{providerId}}).',
  viewQueryFailed: 'Query on view failed. Error category: {{category}}. Description: {{description}}.',

  // Onepanel errors
  errorOnNodes: 'Error on nodes {{hostnames}}: {{error}}',
  dnsServersUnreachable: 'Error fetching DNS records. Used servers: {{servers}}.',
  fileAllocation: 'File allocation error. Allocated {{actualSize}} out of {{targetSize}}.',
  letsEncryptNotReachable: 'Connecting to Let\'s Encrypt server failed.',
  letsEncryptResponse: 'Bad Let\'s Encrypt response: {{errorMessage}}.',
  nodeAlreadyInCluster: 'Cannot add "{{hostname}}", it is already part of a cluster.',
  nodeNotCompatible: 'Cannot add "{{hostname}}", it is a {{clusterType}} node.',
  noConnectionToNewNode: 'Cannot add node "{{hostname}}", connection failed.',
  noServiceNodes: 'Service {{service}} is not deployed on any node.',
  userNotInCluster: 'Authenticated user is not a member of this cluster.',

  // Unexpected error
  unexpectedError: 'Unexpected error, reference: {{reference}}.',

  translationParts: {
    inviteToken: 'invite token',
    accessToken: 'access token',
    identityToken: 'identity token',
    storageTestOperations: {
      read: 'read',
      write: 'write',
      remove: 'remove',
    },
    nodeServices: {
      couchbase: 'Database',
      cluster_manager: 'Cluster Manager',
      cluster_worker: 'Cluster Worker',
      letsencrypt: 'Let\'s Encrypt',
      oneprovider: 'Oneprovider',
      op_worker: 'Oneprovider Worker',
      onezone: 'Onezone',
      oz_worker: 'Onezone Worker',
      ceph: 'Ceph',
      ceph_osd: 'Ceph Object Storage Daemon',
      ceph_mgr: 'Ceph Manager',
      ceph_mon: 'Ceph Monitor',
    },
    posixErrno: {
      eperm: 'Not super-user',
      enoent: 'No such file or directory',
      esrch: 'No such process',
      eintr: 'Interrupted system call',
      eio: 'I/O error',
      enxio: 'No such device or address',
      e2big: 'Arg list too long',
      enoexec: 'Exec format error',
      ebadf: 'Bad file number',
      echild: 'No children',
      eagain: 'Temporary failure',
      enomem: 'Not enough core',
      eacces: 'Permission denied',
      efault: 'Bad address',
      enotblk: 'Block device required',
      ebusy: 'Mount device busy',
      eexist: 'File exists',
      exdev: 'Cross-device link',
      enodev: 'No such device',
      enotdir: 'Not a directory',
      eisdir: 'Is a directory',
      einval: 'Invalid argument',
      enfile: 'Too many open files in system',
      emfile: 'Too many open files',
      enotty: 'Not a typewriter',
      etxtbsy: 'Text file busy',
      efbig: 'File too large',
      enospc: 'No space left on device',
      espipe: 'Illegal seek',
      erofs: 'Read only file system',
      emlink: 'Too many links',
      epipe: 'Broken pipe',
      edom: 'Math arg out of domain of func',
      erange: 'Math result not representable',
      enomsg: 'No message of desired type',
      eidrm: 'Identifier removed',
      echrng: 'Channel number out of range',
      el2nsync: 'Level 2 not synchronized',
      el3hlt: 'Level 3 halted',
      el3rst: 'Level 3 reset',
      elnrng: 'Link number out of range',
      eunatch: 'Protocol driver not attached',
      enocsi: 'No CSI structure available',
      el2hlt: 'Level 2 halted',
      edeadlk: 'Deadlock condition',
      enolck: 'No record locks available',
      ebade: 'Invalid exchange',
      ebadr: 'Invalid request descriptor',
      exfull: 'Exchange full',
      enoano: 'No anode',
      ebadrqc: 'Invalid request code',
      ebadslt: 'Invalid slot',
      edeadlock: 'File locking deadlock error',
      ebfont: 'Bad font file fmt',
      enostr: 'Device not a stream',
      enodata: 'No data (for no delay io)',
      etime: 'Timer expired',
      enosr: 'Out of streams resources',
      enonet: 'Machine is not on the network',
      enopkg: 'Package not installed',
      eremote: 'The object is remote',
      enolink: 'The link has been severed',
      eadv: 'Advertise error',
      esrmnt: 'Srmount error',
      ecomm: 'Communication error on send',
      eproto: 'Protocol error',
      emultihop: 'Multihop attempted',
      elbin: 'Inode is remote (not really error)',
      edotdot: 'Cross mount point (not really error)',
      ebadmsg: 'Trying to read unreadable message',
      eftype: 'Inappropriate file type or format',
      enotuniq: 'Given log. name not unique',
      ebadfd: 'f.d. invalid for this operation',
      eremchg: 'Remote address changed',
      elibacc: 'Can \'t access a needed shared lib ',
      elibbad: 'Accessing a corrupted shared lib',
      elibscn: '.lib section in a.out corrupted',
      elibmax: 'Attempting to link in too many libs',
      elibexec: 'Attempting to exec a shared library',
      enosys: 'Function not implemented',
      enmfile: 'No more files',
      enotempty: 'Directory not empty',
      enametoolong: 'File or path name too long',
      eloop: 'Too many symbolic links',
      eopnotsupp: 'Operation not supported on transport endpoint',
      epfnosupport: 'Protocol family not supported',
      econnreset: 'Connection reset by peer',
      enobufs: 'No buffer space available',
      eafnosupport: 'Address family not supported by protocol family',
      eprototype: 'Protocol wrong type for socket',
      enotsock: 'Socket operation on non-socket',
      enoprotoopt: 'Protocol not available',
      eshutdown: 'Can \'t send after socket shutdown ',
      econnrefused: 'Connection refused',
      eaddrinuse: 'Address already in use',
      econnaborted: 'Connection aborted',
      enetunreach: 'Network is unreachable',
      enetdown: 'Network interface is not configured',
      etimedout: 'Connection timed out',
      ehostdown: 'Host is down',
      ehostunreach: 'Host is unreachable',
      einprogress: 'Connection already in progress',
      ealready: 'Socket already connected',
      edestaddrreq: 'Destination address required',
      emsgsize: 'Message too long',
      eprotonosupport: 'Unknown protocol',
      esocktnosupport: 'Socket type not supported',
      eaddrnotavail: 'Address not available',
      eisconn: 'Socket is already connected',
      enotconn: 'Socket is not connected',
      enotsup: 'Not supported',
      enomedium: 'No medium (in tape drive)',
      enoshare: 'No such host or network path',
      ecaseclash: 'Filename exists with different case',
      eoverflow: 'Value too large for defined data type',
    },
  },
};
