import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Layout } from 'antd';

import Header from './Header';
import Login from './Login';
import PostList from './PostList';
import CreatePost from './CreatePost';
import Search from './Search';
import Account from './Account';
import User from './User';
import Signup from './Signup';

const { Content } = Layout;

class App extends Component {
  render() {
    return (
      <Layout>
        <Header />
        <Content
          style={{
            padding: '0 50px',
            marginTop: 64,
            height: 'calc(100vh - 64px)',
            overflowY: 'scroll'
          }}
        >
          <Switch>
            <Route exact path="/" render={() => <Redirect to="/new" />} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/signup" component={Signup} />
            <Route exact path="/create" component={CreatePost} />
            <Route exact path="/search" component={Search} />
            <Route exact path="/top" component={PostList} />
            <Route exact path="/new" component={PostList} />
            <Route exact path="/account" component={Account} />
            <Route exact path="/user/:id" component={User} />
          </Switch>
        </Content>
      </Layout>
    );
  }
}

export default App;
