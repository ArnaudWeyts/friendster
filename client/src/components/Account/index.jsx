import React from 'react';
import { Query } from 'react-apollo';
import { gql } from 'apollo-boost';

import Post from './Post';

export const USERFEED_QUERY = gql`
  query GetPostsForUserQuery($userId: ID!) {
    feedForUser(userId: $userId) {
      posts {
        id
        body
      }
    }
  }
`;

const Account = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column'
      }}
    >
      <h2 style={{ marginTop: 10 }}>My account</h2>
      <Query
        query={USERFEED_QUERY}
        variables={{ userId: localStorage.getItem('USER_ID') }}
      >
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) return <div>Error loading feed</div>;

          if (data.feedForUser.posts.length === 0) {
            return <div>You haven't submitted any posts yet.</div>;
          }

          return data.feedForUser.posts.map(post => (
            <Post key={post.id} post={post} />
          ));
        }}
      </Query>
    </div>
  );
};

export default Account;
