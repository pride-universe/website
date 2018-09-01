import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081'
});

function updateJWT (response) {
  console.log(response);
  if (response.headers['x-jwt']) {
    if (response.headers['x-jwt'] === 'delete') {
      window.localStorage.removeItem('jwt');
      window.sessionStorage.removeItem('jwt');
    }
    try {
      window.localStorage.setItem('jwt', response.headers['x-jwt']);
    } catch (err) {
      window.sessionStorage.setItem('jwt', response.headers['x-jwt']);
    }
  }
}

function injectJWT (request) {
  console.log(request);
  const jwt = window.localStorage.getItem('jwt') || window.sessionStorage.getItem('jwt');
  if (jwt) {
    request.headers['X-jwt'] = jwt;
  }
}

api.interceptors.response.use(function (response) {
  updateJWT(response);
  return response;
});
api.interceptors.request.use(function (request) {
  injectJWT(request);
  return request;
});
export default api;
