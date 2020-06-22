/*
 *
 * Login actions
 *
 */

import * as cons from './constants';

export function defaultAction() {
  return {
    type: cons.DEFAULT_ACTION,
  };
}
export function actionChangeParams(payload) {
  return {
    type: cons.CHANGE_PARAMS,
    payload,
  };
}

export function actionRequestLogin() {
  return {
    type: cons.REQUEST_LOGIN,
  };
}
export function actionRequestLoginSuc() {
  return {
    type: cons.REQUEST_LOGIN_SUC,
  };
}
export function actionRequestLoginFail() {
  return {
    type: cons.REQUEST_LOGIN_FAIL,
  };
}
