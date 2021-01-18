/**
 * 搜索结果页头部
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { loginOut } from 'containers/App/actions';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

import { HeaderContainer, Part, JumpP, Title } from './styled';

function HeaderCom({ collapsed, onHandleChangeCollapsed }) {
  const dispatch = useDispatch();

  const onLogout = () => dispatch(loginOut());

  return (
    <HeaderContainer>
      <Part>
        {collapsed ? (
          <MenuUnfoldOutlined
            onClick={() => onHandleChangeCollapsed(!collapsed)}
          />
        ) : (
          <MenuFoldOutlined
            onClick={() => onHandleChangeCollapsed(!collapsed)}
          />
        )}
      </Part>
      <Part>
        <Title>name</Title>
        <JumpP onClick={onLogout}>退出</JumpP>
      </Part>
    </HeaderContainer>
  );
}

/*
 *
 * collapsed 侧边栏状态 true收起  false展开
 * onHandleChangeCollapsed
 *
 */
HeaderCom.propTypes = {
  collapsed: PropTypes.bool,
  onHandleChangeCollapsed: PropTypes.func,
};

export default HeaderCom;
