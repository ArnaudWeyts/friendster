import React, { Fragment } from 'react';
import { Query, Mutation } from 'react-apollo';
import { gql } from 'apollo-boost';
import { Redirect } from 'react-router-dom';

import { Button } from 'antd';

import PostList from './PostList';

const USER_QUERY = gql`
  query UserQuery($id: ID!) {
    user(id: $id) {
      user_name
      followers {
        id
      }
      posts {
        id
        body
        createdAt
        likes {
          id
        }
        author {
          id
          user_name
        }
      }
    }
  }
`;

const FOLLOW_MUTATION = gql`
  mutation FollowMutation($id: ID!) {
    follow(id: $id) {
      id
    }
  }
`;

const UNFOLLOW_MUTATION = gql`
  mutation UnfollowMutation($id: ID!) {
    unfollow(id: $id) {
      id
    }
  }
`;

const User = props => {
  const userId = props.match.params.id;

  if (userId === localStorage.getItem('USER_ID')) {
    return <Redirect to="/account" />;
  }

  const _updateCache = (store, { data }) => {
    const user = store.readQuery({
      query: USER_QUERY,
      variables: { id: userId }
    }).user;

    // follow
    if (data.follow) user.followers.unshift(data.follow);

    // unfollow
    if (data.unfollow) {
      const index = user.followers.findIndex(
        follower => follower.id === data.unfollow.id
      );
      if (index > -1) {
        user.followers.splice(index, 1);
      }
    }

    store.writeQuery({
      query: USER_QUERY,
      data: { user },
      variables: { id: userId }
    });
  };

  return (
    <Query query={USER_QUERY} variables={{ id: userId }}>
      {({ loading, error, data }) => {
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error loading feed</div>;

        if (data.user.posts.length === 0) {
          return <div>This user doesn't have any posts yet.</div>;
        }

        return (
          <Fragment>
            <div style={{ display: 'flex', marginTop: 10 }}>
              <h2 style={{ margin: 0, flexGrow: 1 }}>{data.user.user_name}</h2>
              {data.user.followers.find(
                follower => follower.id === localStorage.getItem('USER_ID')
              ) ? (
                <Mutation
                  mutation={UNFOLLOW_MUTATION}
                  variables={{ id: userId }}
                  update={_updateCache}
                  optimisticResponse={{
                    unfollow: { id: userId, __typename: 'User' }
                  }}
                >
                  {unfollow => <Button onClick={unfollow}>Unfollow</Button>}
                </Mutation>
              ) : (
                <Mutation
                  mutation={FOLLOW_MUTATION}
                  variables={{ id: userId }}
                  update={_updateCache}
                  optimisticResponse={{
                    follow: { id: userId, __typename: 'User' }
                  }}
                >
                  {follow => <Button onClick={follow}>Follow</Button>}
                </Mutation>
              )}
            </div>
            <PostList posts={data.user.posts} />
          </Fragment>
        );
      }}
    </Query>
  );
};

export default User;
