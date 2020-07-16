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

  const postFatherMessage = () => {
    // 可以向父窗体返回结果
    window.parent.postMessage({code: 200}, "*");
  }

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
      <ActionBtn type="primary" onClick={postFatherMessage}>发送message</ActionBtn>
      <ActionBtn type="primary" onClick={handelJumpDashboard}>面板</ActionBtn>
    </Container>
  );
}
