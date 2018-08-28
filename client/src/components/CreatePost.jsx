import React, { Component } from 'react';
import { gql } from 'apollo-boost';
import { Mutation } from 'react-apollo';
import { Card, Form, Input, Button } from 'antd';
import { Redirect } from 'react-router-dom';

import { POSTS_PER_PAGE } from '../constants';

import { FEED_QUERY } from './PostList';
import { USERFEED_QUERY } from './Account';
import { AUTH_TOKEN } from '../constants';

const POST_MUTATION = gql`
  mutation PostMutation($body: String!) {
    createPost(body: $body) {
      id
      body
      author {
        id
        user_name
      }
      likes {
        id
        user {
          id
        }
      }
    }
  }
`;

const _updateCache = (store, { data: { createPost } }) => {
  const first = POSTS_PER_PAGE;
  const skip = 0;
  const orderBy = 'createdAt_DESC';
  const userId = localStorage.getItem('USER_ID');

  /** Pretty shitty way of updating the cache, be warned
   * Use defaults instead
   */

  let dataFeed;
  // See if there's a cached entry and write it
  try {
    dataFeed = store.readQuery({
      query: FEED_QUERY,
      variables: { first, skip, orderBy }
    });
  } catch (error) {
  } finally {
    if (dataFeed) {
      dataFeed.feed.posts.unshift(createPost);
      store.writeQuery({
        query: FEED_QUERY,
        data: dataFeed,
        variables: { first, skip, orderBy }
      });
    }
  }

  let dataUserFeed;
  // See if there's a cached version
  try {
    dataUserFeed = store.readQuery({
      query: USERFEED_QUERY,
      variables: { first, skip, orderBy, userId }
    });
  } catch (error) {
  } finally {
    if (dataUserFeed) {
      dataUserFeed.feedForUser.posts.unshift(createPost);
      store.writeQuery({
        query: USERFEED_QUERY,
        data: dataUserFeed,
        variables: { first, skip, orderBy, userId }
      });
    }
  }
};

class CreatePost extends Component {
  state = {
    body: ''
  };

  render() {
    const { body } = this.state;

    if (!localStorage.getItem(AUTH_TOKEN)) {
      return <Redirect to="/" />;
    }

    return (
      <Card style={{ marginTop: 10 }}>
        <Form>
          <Form.Item>
            <Input.TextArea
              rows={3}
              value={body}
              onChange={e =>
                this.setState({
                  body: e.target.value
                })
              }
              placeholder="Post content"
            />
          </Form.Item>
          <Mutation
            mutation={POST_MUTATION}
            variables={{ body }}
            onCompleted={() => this.props.history.push('/new')}
            update={_updateCache}
          >
            {postMutation => (
              <Button type="primary" onClick={postMutation}>
                Submit
              </Button>
            )}
          </Mutation>
        </Form>
      </Card>
    );
  }
}

export default CreatePost;
