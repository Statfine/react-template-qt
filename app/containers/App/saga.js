import { fork, call, takeLatest, put, select /* , take, all */ } from 'redux-saga/effects';
import { clearLocal /* ,, setLocal, removeLocal */ } from 'utility/localStorageCookie';
// import { LOCATION_CHANGE } from 'connected-react-router/immutable';
import { LOGIN_CHANGE, LOGIN_OUT } from './constants';

import Api from './api';
import { changeLogined, fetchUserInfo } from './actions';
import { makeSelectLogined } from './selectors';

/**
 * Token刷新
 * 页面跳转都需要调用该方法判断token是否有效
 * 刷新token的条件：拥有refresh_token同时没有access_token或者有效期前24小时
 * refreshing_token 设置为1，是因为异步同时执行接口都报错的时候request重复执行reload
 */
// function* tokenSagaWatcher() {
//   while (true) {
//     try {
//       if ((!localStorage.access_token || Date.now() > localStorage.expires_in - 3600000 * 24)
//       && !!localStorage.refresh_token) {
//         setLocal('refreshing_token', 1)
//         const result = yield call(Api.refreshToken);
//         removeLocal('refreshing_token');
//         setLocal('access_token', result.access_token);
//         setLocal('expires_in', Date.now() + (result.expires_in * 1000));
//         setLocal('refresh_token', result.refresh_token);
//         yield put(changeLogined(true));
//       }
//     } catch (error) {
//       clearLocal();
//       yield put(changeLogined(false));
//       window.location.reload();
//     }
//     yield take(LOCATION_CHANGE);
//   }
// }

function* fetchUserInfoWatcher() {
  const login = yield select(makeSelectLogined());
  if (login) {
    console.log('fetchUserInfoSaga');
    // yield all([
    //   call(fetchUserInfoSaga),
    // ]);
  }
}

export function* fetchUserInfoSaga() {
  try {
    const data = yield call(Api.fetchUserInfo);
    const { socials, policy, guides, kandian, tags, ...user } = data.data;
    yield put(fetchUserInfo({ user }));
  } catch (error) {
    console.log(error);
  }
}

function* loginOutWatcher() {
  try {
    // yield call(Api.userLogout);
    clearLocal();
    yield put(changeLogined(false));
  } catch (e) {
    //
  }
}

/**
 * tokenSagaWatcher token刷新
 * fetchUserInfoWatcher 获取用户信息
 * loginOutWatcher 退出
 * 
 * 用户打开页面执行
 * 1. 判断是否需要刷新token(tokenSagaWatcher) 同时判断 是否需要加载用户信息fetchUserInfoWatcher
 * 2. 如果刷新token成功，则再次去获取用户信息
 * 
 * 用户退出 清空localStorage， 修改logined状态
 */
export default function* defaultSaga() {
  // yield fork(tokenSagaWatcher);
  yield fork(fetchUserInfoWatcher);
  yield takeLatest(LOGIN_CHANGE, fetchUserInfoWatcher);
  yield takeLatest(LOGIN_OUT, loginOutWatcher);
}
