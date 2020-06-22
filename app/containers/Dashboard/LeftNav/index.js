/**
 *
 * Login
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Layout, Menu } from 'antd';
import history from 'utils/history';

import ROOT from './root';

const { SubMenu } = Menu;
const { Sider } = Layout;

const LeftSilder = styled(Sider)`
  width: 200;
  background: #fff;
  box-shadow: 0 0 7px 0 rgba(0, 0, 0, 0.12);
  z-index: 500;
  color: #4885ed;
  display: flex;
  flex-direction: column;
  align-content: space-around;
  margin-bottom: -20px;
  overflow-y: auto;
`;

const LogoDiv = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  position: relative;
  line-height: 64px;
  transition: all 0.3s;
  overflow: hidden;
  box-shadow: rgb(240, 241, 242) 0px 2px 8px;
  & img {
    display: inline-block;
    vertical-align: middle;
    height: 32px;
    margin: 0 4px 0 24px;
  }
  & p {
    color: #000;
    display: inline-block;
    vertical-align: middle;
    font-size: 20px;
    margin: 0 0 0 12px;
    font-weight: 600;
  }
`;

const SubMenuTitle = styled.div`
  display: flex;
  align-items: center;
`;

export const urlToList = (url) => {
  const urllist = url.split('/').filter(i => i);
  return urllist.map((urlItem, index) => `/${urllist.slice(0, index + 1).join('/')}`);
}

/* eslint-disable react/prefer-stateless-function */
class LeftNav extends React.PureComponent {
  /**
   *  openKey 页面初始值，Item点击跳转之后改变
   */
  state = { openKey: [] }

  // Menud 点击
  onHandleSelect = (openKey) => this.setState({ openKey });

  // ITEM点击
  onJump = (url, openKey = []) => {
    history.push(url);
    this.setState({ openKey })
  }

  // Get the currently selected menu
  getSelectedMenuKeys = pathname => urlToList(pathname);

  // 渲染单个个menu
  renderSingleMenu = item => (
    <Menu.Item key={item.url} onClick={() => this.onJump(item.url)}>
      <item.icon />
      <span>{item.name}</span>
    </Menu.Item>
  )

  // 渲染组合menu
  renderListMeny = item => (
    <SubMenu
      key={item.url}
      title={
        <SubMenuTitle>
          <item.icon />
          <span>{item.name}</span>
        </SubMenuTitle>
      }
    >
      {
        item.listUrl.map((i) => (
          <Menu.Item
            key={i.url}
            onClick={() => this.onJump(i.url)}
          >{i.name}</Menu.Item>
        ))
      }
    </SubMenu>
  )

  render() {
    const {
      location: { pathname },
      collapsed,
    } = this.props;
    const { openKey } = this.state;
    const selectedKeys = this.getSelectedMenuKeys(pathname);
    const props = collapsed ? {} : { openKeys: openKey.length === 0 ? selectedKeys : openKey };
    return (
      <LeftSilder trigger={null} collapsible collapsed={collapsed}>
        <LogoDiv id="logo" onClick={() => this.onJump('/')}>
          <img src="" alt="logo" />
          {!collapsed && <p>面板</p>}
        </LogoDiv>
        <Menu
          key="Menu"
          mode="inline"
          // theme="dark"
          selectedKeys={selectedKeys}
          onOpenChange={this.onHandleSelect}
          style={{ height: '100%', borderRight: 0 }}
          {...props}
        >
          {
            ROOT.map((item) => (
              item.type === 'single' ? 
                this.renderSingleMenu(item) : this.renderListMeny(item)
            ))
          }
        </Menu>
      </LeftSilder>
    );
  }
}

LeftNav.propTypes = {
  location: PropTypes.object,
  collapsed: PropTypes.bool,
};

export default LeftNav;
