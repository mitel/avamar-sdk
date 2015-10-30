import api from './apiConfig';
import { login, logout } from './login';
import { createResourcePool, deleteResourcePool } from './resourcePool';
import { createDataProtectionResource, deleteDataProtectionResource } from './dataProtectionResource';
import { createTenant, deleteTenant } from './tenant';
import { createResourceShare, assignResourceShare, deleteResourceShare } from './resourceShare';
import { createFolder, deleteFolder } from './folder';
import { getTaskResult } from './task';

export default function initSDK() {
  return {
    config: api,
    login,
    logout,
    createResourcePool,
    deleteResourcePool,
    createDataProtectionResource,
    deleteDataProtectionResource,
    createTenant, 
    deleteTenant,
    createResourceShare,
    assignResourceShare,
    deleteResourceShare,
    createFolder,
    deleteFolder,
    getTaskResult,
  };
}
