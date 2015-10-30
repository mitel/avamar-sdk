import rest from 'restling';
import api from './apiConfig';

// initiates a task that creates a folder for a certain tenant, into a certain resource share
  /*
    Creates a top-level folder for the tenant, request must specify a resourceShare.
    This is an async operation, so the resut is a Task object, not the actual Folder object
  */
export function createFolder(authToken, resourceShareId, tenantId, 
  topLevelFolderConfig = api.initialConfig.topLevelFolder) {

  const _resourceShareUrl = 'https://' + api.restServerHost + ':' + api.restServerPort + '/rest-api/resourceShare/' + resourceShareId;
  
  const _data = JSON.stringify({
    folder: {
      ...topLevelFolderConfig,
      resourceShare: {
        href: _resourceShareUrl,
      },
    },
  });

  const _url = 'https://' + api.restServerHost + ':' + api.restServerPort + '/rest-api/tenant/' + tenantId + '/folder';
  const _requestOptions = {
    headers: {...api.httpHeaders, 'x-concerto-authorization': authToken },
    data: _data,
  };

  return new Promise((resolve, reject) => {
    rest.post(_url, _requestOptions).then(result => {
      // console.log(result.response.headers['x-concerto-authorization']);
      return resolve({
        taskId: result.data.id,
        data: result.data,
        response: result.response, 
      });
    }, error => {
      // console.log(error);
      return reject(error);
    });  
  });
}

/*
    Deletes a folder. 
    Fails if any child/children exist. 
    Force and recursive query params can be used to force delete the clients and traverse 
    folder recursively for deletion.
  */
export function deleteFolder(authToken, folderId, force = false, recursive = false) {
  
  const _url = 'https://' + api.restServerHost + ':' + api.restServerPort + '/rest-api/folder/' + folderId + '?force=' + force + '&recursive=' + recursive;
  const _requestOptions = {
    headers: {...api.httpHeaders, 'x-concerto-authorization': authToken },
  };

  return new Promise((resolve, reject) => {
    rest.del(_url, _requestOptions).then(result => {
      // console.log(result.response.headers['x-concerto-authorization']);
      return resolve({
        taskId: result.data.id,
        data: result.data,
        response: result.response, 
      });
    }, error => {
      // console.log(error);
      return reject(error);
    });  
  });
}
