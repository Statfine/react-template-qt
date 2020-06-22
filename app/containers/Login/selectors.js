import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the login state domain
 */

const selectLoginDomain = state => state.login || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by Login
 */

const makeSelectLogin = () =>
  createSelector(selectLoginDomain, substate => substate);
  
const makeSelectParams = () =>
  createSelector(selectLoginDomain, substate => substate.params);
const makeSelectIsRequesting = () =>
  createSelector(selectLoginDomain, substate => substate.isRequesting);

export default makeSelectLogin;
export { selectLoginDomain, makeSelectParams, makeSelectIsRequesting };
