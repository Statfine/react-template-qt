/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { hot } from 'react-hot-loader/root';
import HomePage from 'containers/HomePage/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import Login from 'containers/Login/Loadable';
import Dashboard from 'containers/Dashboard/Loadable';
import OpenLayer from 'containers/Openlayer';
import OpenLayerMap from 'containers/OpenLayerMap';
import GaoDeMap from 'containers/GaoDeMap';
import HistoryPage from 'containers/HistoryPage';

import { useInjectReducer, useInjectSaga } from 'redux-injectors';

import reducer from './reducer';
import saga from './saga';

import GlobalStyle from '../../global-styles';

import {
  userIsAuthenticatedRedir,
  userIsNotAuthenticatedRedir,
} from '../../auth';

/*
 * 是否登录的判断条件是reducer logined
 * userIsAuthenticatedRedir 需登录后才能打开的页面,否则重定向到 /
 * userIsNotAuthenticatedRedir 未登录才能打开，否则重新向到 ／
 */
const LoginPage = userIsNotAuthenticatedRedir(Login);
const DashboardPage = userIsAuthenticatedRedir(Dashboard);


const styleApp = {
  height: '100vh',
  width: '100vw',
}
function App() {

  useInjectReducer({ key: 'app', reducer });
  useInjectSaga({ key: 'app', saga });

  return (
    <div style={styleApp}>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/openlayer" component={OpenLayer} />
        <Route path="/openlayermap" component={OpenLayerMap} />
        <Route path="/gaode" component={GaoDeMap} />
        <Route path="/params" component={HistoryPage} />
        <Route component={NotFoundPage} />
      </Switch>
      <GlobalStyle />
    </div>
  );
}

export default hot(App);