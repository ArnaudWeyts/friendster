import React, { Fragment } from 'react';
import { gql } from 'apollo-boost';
import { Mutation } from 'react-apollo';
import { Link } from 'react-router-dom';

import { Card, Icon, Avatar } from 'antd';

import { AUTH_TOKEN } from '../constants';
import { timeDifferenceForDate } from '../utils';

const authToken = localStorage.getItem(AUTH_TOKEN);

const LIKE_MUTATION = gql`
  mutation LikeMuation($postId: ID!) {
    like(postId: $postId) {
      id
      post {
        likes {
          id
          user {
            id
          }
        }
        author {
          id
        }
      }
    }
  }
`;

const renderLike = ({ post, updateStoreAfterLike }) => {
  if (!authToken)
    return (
      <Link to="/login">
        <Icon type="like" /> Like
      </Link>
    );

  return (
    <Mutation
      mutation={LIKE_MUTATION}
      variables={{ postId: post.id }}
      update={(store, { data: { like } }) =>
        updateStoreAfterLike(store, like, post.id)
      }
    >
      {likeMutation => (
        <div onClick={likeMutation}>
          <Icon type="like" /> Like
        </div>
      )}
    </Mutation>
  );
};

const Post = props => {
  const { post } = props;

  return (
    <Card
      actions={[<Fragment>{renderLike(props)}</Fragment>]}
      style={{ marginTop: 10 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <Avatar>{post.author.user_name.charAt(0)}</Avatar>
        <div style={{ display: 'inline-block', marginLeft: 10 }}>
          <h3 style={{ margin: 0 }}>
            <Link to={`/user/${post.author.id}`}>{post.author.user_name}</Link>
          </h3>
          {timeDifferenceForDate(post.createdAt)}
        </div>
      </div>
      <p style={{ margin: '0 0' }}>{post.body}</p>
      {post.likes.length !== 0 && (
        <p style={{ margin: '10px 0 0 0' }}>
          <Icon type="like" /> {post.likes.length} like
          {post.likes.length > 1 ? 's' : ''}
        </p>
      )}
    </Card>
  );
};

export default Post;
