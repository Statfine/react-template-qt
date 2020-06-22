/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import history from 'utils/history';
import { useSelector, useDispatch } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { makeSelectLogined } from 'containers/App/selectors';
import { loginOut } from 'containers/App/actions';

import { Container, ActionBtn } from './styled';

/**
 * logined 是否已登录
*/
const stateSelector = createStructuredSelector({
  logined: makeSelectLogined(),
});

export default function HomePage() {

  const dispatch = useDispatch();
  const { logined } = useSelector(stateSelector);

  const handleLogout = () => dispatch(loginOut());
  const handleLogin = () => history.push('/login');
  const handelJumpDashboard = () => history.push('/dashboard');

  return (
    <Container>
      <Helmet>
        <title>首页</title>
      </Helmet>
      {
        logined ?
          <ActionBtn type="primary" onClick={handleLogout}>退出</ActionBtn> :
          <ActionBtn type="primary" onClick={handleLogin}>登录</ActionBtn>
      }
      <ActionBtn type="primary" onClick={handelJumpDashboard}>面板</ActionBtn>
    </Container>
  );
}
