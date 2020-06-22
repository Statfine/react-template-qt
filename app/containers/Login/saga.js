import { takeLatest, select, put, call, delay } from 'redux-saga/effects';
import { setLocal } from 'utility/localStorageCookie';
import { REQUEST_LOGIN } from './constants';
import { makeSelectParams } from './selectors';
import { actionRequestLoginSuc, actionRequestLoginFail } from './actions';
import { changeLogined } from '../App/actions';

import LoginApi from './api';
// 获取列表
export function* fetchLoginSaga() {
  try {
    const params = yield select(makeSelectParams());
    const result = yield call(LoginApi.fetchLogin, params);
    yield delay(2000);
    console.log('fetchLoginSaga', result)
    setLocal('access_token', 'result.access_token');
    setLocal('expires_in', Date.now() + (3600000 * 1000));
    yield put(actionRequestLoginSuc());
    yield put(changeLogined(true));
  } catch (error) {
    // console.log(error);
    yield put(actionRequestLoginFail());
  }
}

// Individual exports for testing
export default function* loginSaga() {
  yield takeLatest([REQUEST_LOGIN], fetchLoginSaga);
}
