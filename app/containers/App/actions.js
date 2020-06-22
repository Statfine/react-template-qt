/*
 * Home Actions
 *
 * Actions change things in your application
 * Since this boilerplate uses a uni-directional data flow, specifically redux,
 * we have these actions which are the only way your application interacts with
 * your application state. This guarantees that your state is up to date and nobody
 * messes it up weirdly somewhere.
 *
 * To add a new Action:
 * 1) Import your constant
 * 2) Add a function like this:
 *    export function yourAction(var) {
 *        return { type: YOUR_ACTION_CONSTANT, var: var }
 *    }
 */

import { LOGIN_CHANGE, LOGIN_OUT, FETCH_USERINFO_SUC,
  CHANGE_PROMPT_INFO } from './constants';

/**
 * Changes the input field of the form
 *
 * @param  {name} name The new text of the input field
 *
 * @return {object}    An action object with a type of CHANGE_USERNAME
 */
export function changeLogined(payload) {
  return {
    type: LOGIN_CHANGE,
    payload,
  };
}

export function loginOut(payload) {
  return {
    type: LOGIN_OUT,
    payload,
  };
}

export function changePromptInfo(payload) {
  return {
    type: CHANGE_PROMPT_INFO,
    payload,
  };
}

export function fetchUserInfo(payload) {
  return {
    type: FETCH_USERINFO_SUC,
    payload,
  };
}
