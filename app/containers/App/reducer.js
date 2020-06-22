/*
 *
 * Form reducer
 *
 */

import produce from 'immer';
import { getLocal } from 'utility/localStorageCookie';
import _ from 'lodash';
import * as cons from './constants';

/*
 * logined Auth用户验证
*/
// 验证用户有效的条件是 必须有access_token 同时有效期大于当前
function isLogined() {
  return !!getLocal('access_token') && Date.now() < Number(getLocal('expires_in'));
}

/**
 *  logined 是否已有用户
 *  userInfo 用户信息
 *  promptInfo 全局提示信息
 */
export const initialState = {
  logined: isLogined(),
  userInfo: {
    user_id: '',
  },
  promptInfo: {
    promptMsg: '',
    promptType: 0,
  },
};

/* eslint-disable default-case, no-param-reassign */
const loginReducer = produce((draft, action) => {
  switch (action.type) {
    case cons.LOGIN_CHANGE:
      draft.logined = action.payload;
      break;
    case cons.FETCH_USERINFO_SUC:
      draft.userInfo = _.merge({}, draft.userInfo, action.payload);
      break;
  }
}, initialState);

export default loginReducer;
