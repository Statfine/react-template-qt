/**
 *
 * Dashboard
 *
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import history from 'utils/history';
import { useSelector, useDispatch } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Layout } from 'antd';
import styled from 'styled-components';

import Header from 'components/Header';

import { useInjectReducer, useInjectSaga } from 'redux-injectors';
import makeSelectDashboard from './selectors';
import reducer from './reducer';
import saga from './saga';

import LeftNav from './LeftNav';

const { Content } = Layout;

const AppWrapper = styled(Layout)`
  height: 100%;
  width: 100%;
`;

const WrapperContent = styled(Content)`
  background: #fff;
  margin: 25px;
  min-height: 280px;
`;

const stateSelector = createStructuredSelector({
  dashboard: makeSelectDashboard(),
});

function Dashboard({ match, location }) {
  useInjectReducer({ key: 'dashboard', reducer });
  useInjectSaga({ key: 'dashboard', saga });

  const [collapsed, handleChangeCollapsed] = useState(collapsed); // 侧边栏状态 true收起  false展开

  /* eslint-disable no-unused-vars */
  const { dashboard } = useSelector(stateSelector);
  const dispatch = useDispatch();
  /* eslint-enable no-unused-vars */

  return (
    <AppWrapper>
      <Helmet>
        <title>面板</title>
      </Helmet>
      <Layout>
        <LeftNav location={location} history={history} collapsed={collapsed} />
        <Layout>
          <Header
            collapsed={collapsed}
            onHandleChangeCollapsed={value => handleChangeCollapsed(value)}
          />
          <WrapperContent>
            <Switch>
              <Route
                exact
                path={match.url}
                component={() => <div>Admin</div>}
                // render={() => <Redirect to={`${this.props.match.path}/trans/grablist`} />}
              />
              <Route
                path={`${match.url}/one/one`}
                component={() => <div>Tab1-1</div>}
              />
              <Route
                path={`${match.path}/one/two`}
                component={() => <div>Tab1-2</div>}
              />
              <Route
                path={`${match.path}/one/three`}
                component={() => <div>Tab1-3</div>}
              />
              <Route
                path={`${match.path}/one/four`}
                component={() => <div>Tab1-4</div>}
              />
              <Route
                path={`${match.path}/two/one`}
                component={() => <div>Tab2-1</div>}
              />
              <Route
                path={`${match.path}/auth`}
                component={() => <div>权限设置</div>}
              />
              <Route
                path="/dashboard/own"
                component={() => <div>个人设置</div>}
              />
              <Route
                path="/dashboard/own"
                component={() => <div>个人设置</div>}
              />
              <Route
                path={`${match.path}/:id/:type`}
                component={() => <div>商户</div>}
              />
              <Route render={() => <Redirect to="/404" />} />
            </Switch>
          </WrapperContent>
        </Layout>
      </Layout>
    </AppWrapper>
  );
}

Dashboard.propTypes = {
  match: PropTypes.object,
  location: PropTypes.object,
};

export default Dashboard;
