/**
 *
 * Login
 *
 */

import React, { memo } from 'react';
// import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import { useSelector, useDispatch } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Input, Button, message } from 'antd';

import { useInjectReducer, useInjectSaga } from 'redux-injectors';
import { makeSelectParams, makeSelectIsRequesting } from './selectors';
import { actionChangeParams, actionRequestLogin } from './actions';
import reducer from './reducer';
import saga from './saga';

/**
 *  params  参数 { password, uasername }
 *  isRequesting 请求状态-true,fasle
*/
const stateSelector = createStructuredSelector({
  params: makeSelectParams(),
  isRequesting: makeSelectIsRequesting(),
});

function Login() {
  useInjectReducer({ key: 'login', reducer });
  useInjectSaga({ key: 'login', saga });

  const { params, isRequesting } = useSelector(stateSelector);
  const dispatch = useDispatch();

  const handleLogin = () => {
    if (params.username.trim().length === 0) message.error('请输入用户名称');
    else if (params.password.trim().length === 0) message.error('请输入密码');
    else dispatch(actionRequestLogin());
  };

  return (
    <>
      <Helmet>
        <title>登录</title>
      </Helmet>
      <Input
        value={params.username}
        onChange={e =>
          dispatch(actionChangeParams({ username: e.target.value }))
        }
      />
      <Input
        value={params.password}
        type="password"
        onChange={e =>
          dispatch(actionChangeParams({ password: e.target.value }))
        }
      />
      <Button type="primary" disabled={isRequesting} onClick={handleLogin}>
        Login
      </Button>
    </>
  );
}

Login.propTypes = {};

export default memo(Login);
