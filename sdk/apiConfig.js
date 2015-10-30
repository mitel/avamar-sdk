const apiConfig = () => ({

  httpHeaders: {
    'Accept': 'application/json; version=1.0',
    'Content-Type': 'application/json; version=1.0',
  },

  restServerCredentials: {
    username: 'admin',
    password: 'password',
  },

  restServerHost: '192.168.1.100',
  restServerPort: '8543',

  initialConfig: {
    resourcePool: {
      name: 'resource-pool-1',
    },

    dataProtectionResource: {
      name: 'data-protection-resource-1',
      user: 'MCUser',
      password: 'password01',
      protocol: 'https',
      hostname: 'avamar',
      port: 9443,
      path: '/services/mcsdk10',
    },

    tenant: {
      name: 'tenant-1',
    },

    resourceShare: {
      name: 'resource-share-1',
      capacityInMB: 200,
    },

    topLevelFolder: {
      name: 'folder-1',
    },
  },

});

export default apiConfig();

export function errorCallback(error) {
  console.log('Error: ' + error.message);
  if (error.response) {
    console.log('Response: ' + error.response);
  }
}

