import restler from 'restler';
import api from './apiConfig';

export function getTaskResult(authToken, taskId) {
  
  const _url = 'https://' + api.restServerHost + ':' + api.restServerPort + '/rest-api/task/' + taskId;
  const _requestOptions = {
    headers: {...api.httpHeaders, 'x-concerto-authorization': authToken },
  };

  const _request = restler.get(_url, _requestOptions);

  return new Promise(function(resolve, reject) {
    _request
      .on('success', function(data, response) {
        if (data.state !== 'SUCCESS') {
          this.retry(500);
        } else {
          resolve({'resultId': data.result.id, 'data': data, 'response': response});
        }
      })
      .on('fail', (data, response) => {
        const errorMessage = 'Cannot GET ' + _url;
        const error = new Error(errorMessage);

        error.statusCode = response.statusCode;
        error.response = response;
        error.data = data;

        reject(error);
      })
      .on('error', err => {
        reject(err);
      })
      .on('abort', () => {
        reject(new Promise.CancellationError());
      })
      .on('timeout', () => {
        reject(new Promise.TimeoutError());
      });
  });
}
