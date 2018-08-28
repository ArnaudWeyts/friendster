import React from 'react';
import { Mutation } from 'react-apollo';
import { gql } from 'apollo-boost';

import { Card, Icon } from 'antd';

import { POSTS_PER_PAGE } from '../../constants';
import { FEED_QUERY } from '../PostList';
import { USERFEED_QUERY } from '../Account';

const DELETE_POST = gql`
  mutation DeletePostMutation($id: ID!) {
    deletePost(id: $id) {
      id
    }
  }
`;

const _updateCache = (store, { data: { deletePost } }) => {
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
      const index = dataFeed.feed.posts.findIndex(
        post => post.id === deletePost.id
      );
      if (index > -1) {
        dataFeed.feed.posts.splice(index, 1);
      }
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
      const index = dataUserFeed.feedForUser.posts.findIndex(
        post => post.id === deletePost.id
      );
      if (index > -1) {
        dataUserFeed.feedForUser.posts.splice(index, 1);
      }
      store.writeQuery({
        query: USERFEED_QUERY,
        data: dataUserFeed,
        variables: { first, skip, orderBy, userId }
      });
    }
  }
};

const Post = ({ post }) => {
  return (
    <Mutation
      mutation={DELETE_POST}
      variables={{ id: post.id }}
      optimisticResponse={{ deletePost: { id: post.id, __typename: 'Post' } }}
      update={_updateCache}
    >
      {deletePost => (
        <Card
          actions={[
            <div onClick={deletePost}>
              <Icon type="delete" /> Delete
            </div>,
            <div>
              <Icon type="edit" /> Edit
            </div>
          ]}
          style={{ marginTop: 10, width: '700px' }}
        >
          <p>{post.body}</p>
          <div />
        </Card>
      )}
    </Mutation>
  );
};

export default Post;
