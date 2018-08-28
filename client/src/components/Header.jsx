import React from 'react';
import { NavLink } from 'react-router-dom';
import { withRouter } from 'react-router';
import { Layout, Menu, Icon, Dropdown } from 'antd';

import { AUTH_TOKEN } from '../constants';

const { Header: AntdHeader } = Layout;

const Header = props => {
  const authToken = localStorage.getItem(AUTH_TOKEN);

  const selectedKey = props.location.pathname.includes('new')
    ? '/new'
    : props.location.pathname;

  const menu = (
    <Menu>
      {authToken && (
        <Menu.Item
          key="logout"
          onClick={() => {
            localStorage.removeItem(AUTH_TOKEN);
            localStorage.removeItem('USER_ID');
            props.history.push(`/`);
          }}
        >
          logout
        </Menu.Item>
      )}
      {authToken && (
        <Menu.Item key="/account">
          <NavLink to="/account">account</NavLink>
        </Menu.Item>
      )}
      {!authToken && (
        <Menu.Item key="/login">
          <NavLink to="/login">login</NavLink>
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <AntdHeader
      style={{
        position: 'fixed',
        zIndex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={[selectedKey]}
        style={{ lineHeight: '64px', flexGrow: 1 }}
      >
        <Menu.Item key={`/new`}>
          <NavLink to="/">new</NavLink>
        </Menu.Item>
        <Menu.Item key="/top">
          {' '}
          <NavLink to="/top">top</NavLink>
        </Menu.Item>
        <Menu.Item key="/search">
          <NavLink to="/search">search</NavLink>
        </Menu.Item>
        {authToken && (
          <Menu.Item key="/create">
            <NavLink to="/create">submit</NavLink>
          </Menu.Item>
        )}
      </Menu>
      <Dropdown overlay={menu} placement="bottomRight">
        <a
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3em',
            height: '3em'
          }}
        >
          <Icon type="user" style={{ display: 'block', fontSize: 20 }} />
        </a>
      </Dropdown>
    </AntdHeader>
  );
};

export default withRouter(Header);
