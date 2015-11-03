import rest from 'restling';
import api from './apiConfig'; 

export function getVersion() {

  const _url = 'https://' + api.restServerHost + ':' + api.restServerPort + '/rest-api/versions';
  const _requestOptions = {
    headers: { ...api.httpHeaders },
  };

  return new Promise((resolve, reject) => {
    rest.get(_url, _requestOptions).then(result => {
      // console.log(result.response.headers['x-concerto-authorization']);
      const _versions = [];
      for (const i of result.data.entryPoint) _versions.push(i.apiVersion);
      return resolve({
        versions: _versions,
        data: result.data,
        response: result.response, 
      });
    }, error => {
      // console.log(error);
      return reject(error);
    });  
  });
}
