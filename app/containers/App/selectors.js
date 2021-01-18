import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the login state domain
 */

const selectRouter = state => state.router;
const selectApp = state => state.app || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by Login
 */

const makeSelectLocation = () =>
  createSelector(selectRouter, routerState => routerState.location);

const makeSelectLogined = () =>
  createSelector(selectApp, appState => appState.logined);

const makeSelectUserInfo = () =>
  createSelector(selectApp, appState => appState.userInfo);

export { makeSelectLocation, makeSelectLogined, makeSelectUserInfo };
