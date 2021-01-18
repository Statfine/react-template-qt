import 'whatwg-fetch';
import _ from 'lodash';
import { getLocal, setLocal } from 'utility/localStorageCookie';
import { message } from 'antd';

// app.js 注入store
// eslint-disable-next-line no-unused-vars
let globalStore;
export function requestInjectStore(store) {
  globalStore = store;
  message.config({
    maxCount: 1,
  });
}

/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */
function parseJSON(response) {
  return response.json().catch(() => {
    const error = new Error('网络异常');
    throw error;
  });
}

function parseData(data) {
  if (data.code === 9001) {
    // token失效时页面刷新 getLocal('refreshing_token')为1时表示正在执行刷新token
    if (getLocal('refreshing_token') === 1) return false;
    setLocal('expires_in', Date.now());
    setLocal('access_token', '');
    if (!getLocal('refresh_token')) {
      window.location.href = '/';
      return false;
    }
    return window.location.reload();
  }
  if (data.code === 9003) window.location.href = '/';
  if (data.code === 9006) {
    window.location.href = '/';
    return false;
  }

  if (data.code === 0 || (data.status_code >= 200 && data.status_code < 300)) {
    return data;
  }

  const error = new Error(data.message);
  error.data = data;
  throw error;
}

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           An object containing either "data" or "err"
 */
export function requestNoSnack(url, options) {
  const defaultOptions = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  if (global.window.localStorage.access_token) {
    defaultOptions.headers.Authorization = `Bearer ${global.window.localStorage.access_token}`;
  }

  const mergeOptions = _.merge({}, defaultOptions, options);
  return fetch(url, mergeOptions)
    .then(parseJSON)
    .then(parseData);
}

/**
 *
 * @param {*} url
 * @param {*} options
 *   noNotice 不做错误提示
 * globalStore.dispatch 失败异常发送方法action
 */
export default function request(url, options) {
  return requestNoSnack(url, options).catch(error => {
    const msg = error.data
      ? error.message
        ? error.message
        : error
      : '网络异常';
    if (error.data && error.data.code === 10093) throw error;
    //  申请未开通
    else if (!options || !options.noNotice) {
      // globalStore.dispatch();
      message.error(msg);
    }
    throw error;
  });
}

export function get(urlString, params = {}, option = {}) {
  const query = Object.keys(params)
    .filter(key => params[key] !== undefined)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  const options = { method: 'GET' };
  const mergeOptions = _.merge({}, options, option);
  if (query) {
    return request(`${urlString}?${query}`, mergeOptions);
  }
  return request(`${urlString}`, mergeOptions);
}

/* eslint-disable */
function mapKeysDeep(obj, func) {
  const keys = Object.keys(obj);
  keys.forEach(key => {
    if (_.isObject(obj[key])) {
      const value = mapKeysDeep(obj[key], func);
      delete obj[key];
      obj[func(key)] = value;
    } else {
      const value = obj[key];
      delete obj[key];
      obj[func(key)] = value;
    }
  });
  return obj;
}
/* eslint-enable  */
