/*
 *
 * Login reducer
 *
 */

import produce from 'immer';
import _ from 'lodash';
import * as cons from './constants';

export const initialState = {
  params: {
    username: '',
    password: '',
  },
  isRequesting: false,
};

/* eslint-disable default-case, no-param-reassign */
const loginReducer = produce((draft, action) => {
  switch (action.type) {
    case cons.DEFAULT_ACTION:
      break;
    case cons.CHANGE_PARAMS:
      draft.params = _.merge({}, draft.params, action.payload);
      break;
    case cons.REQUEST_LOGIN:
      draft.isRequesting = true;
      break;
    case cons.REQUEST_LOGIN_SUC:
    case cons.REQUEST_LOGIN_FAIL:
      draft.isRequesting = false;
      break;
  }
}, initialState);

export default loginReducer;
