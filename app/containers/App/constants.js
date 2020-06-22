/*
 * AppConstants
 * Each action has a corresponding type, which the reducer knows and picks up on.
 * To avoid weird typos between the reducer and the actions, we save them as
 * constants here. We prefix them with 'yourproject/YourComponent' so we avoid
 * reducers accidentally picking up actions they shouldn't.
 *
 * Follow this format:
 * export const YOUR_ACTION_CONSTANT = 'yourproject/YourContainer/YOUR_ACTION_CONSTANT';
 */
export const LOGIN_CHANGE = 'app/App/LOGIN_CHANGE';
export const LOGIN_OUT = 'app/App/LOGIN_OUT';
export const CHANGE_PROMPT_INFO = 'app/App/CHANGE_PROMPT_INFO';

export const FETCH_USERINFO = 'app/App/FETCH_USERINFO';
export const FETCH_USERINFO_SUC = 'app/App/FETCH_USERINFO_SUC';
export const FETCH_USERINFO_ERROR = 'app/App/FETCH_USERINFO_ERROR';