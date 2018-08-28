import React from 'react';
import { Query } from 'react-apollo';
import { gql } from 'apollo-boost';
import InfiniteScroll from 'react-infinite-scroller';

import { Spin, Col } from 'antd';

import { POSTS_PER_PAGE } from '../constants';
import Post from './Post';

export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: PostOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      count
      posts {
        id
        body
        createdAt
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
  }
`;

const NEW_POSTS_SUBSCRIPTION = gql`
  subscription {
    newPost {
      node {
        id
        body
        createdAt
        author {
          id
          user_name
        }
        likes {
          id
        }
      }
    }
  }
`;

const NEW_LIKES_SUBSCRIPTION = gql`
  subscription {
    newLike {
      node {
        id
        post {
          id
          body
          createdAt
          author {
            id
            user_name
          }
          likes {
            id
          }
        }
        user {
          id
        }
      }
    }
  }
`;

const _updateCacheAfterLike = (store, createLike, postId, props) => {
  const isNewPage = props.location.pathname.includes('new');

  const skip = 0;
  const first = isNewPage ? POSTS_PER_PAGE : 100;
  const orderBy = isNewPage ? 'createdAt_DESC' : null;

  const data = store.readQuery({
    query: FEED_QUERY,
    variables: { first, skip, orderBy }
  });

  const likedPost = data.feed.posts.find(post => post.id === postId);
  likedPost.likes = createLike.post.likes;

  store.writeQuery({ query: FEED_QUERY, data });
};

const _subscribeToNewPosts = subscribeToMore => {
  subscribeToMore({
    document: NEW_POSTS_SUBSCRIPTION,
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev;
      const newPost = subscriptionData.data.newPost.node;

      return Object.assign({}, prev, {
        feed: {
          posts: [newPost, ...prev.feed.posts],
          count: prev.feed.posts.length + 1,
          __typename: prev.feed.__typename
        }
      });
    }
  });
};

const _subscribeToNewLikes = subscribeToMore => {
  subscribeToMore({
    document: NEW_LIKES_SUBSCRIPTION
  });
};

const _getQueryVariables = props => {
  const isNewPage = props.location.pathname.includes('new');

  const skip = 0;
  const first = isNewPage ? POSTS_PER_PAGE : 100;

  const orderBy = isNewPage ? 'createdAt_DESC' : null;

  return { skip, first, orderBy };
};

const _getPostsToRender = (data, props) => {
  const isNewPage = props.location.pathname.includes('new');
  if (isNewPage) {
    return data.feed.posts;
  }
  const rankedPosts = data.feed.posts.slice();
  rankedPosts.sort((l1, l2) => l2.likes.length - l1.likes.length);
  return rankedPosts;
};

const Loader = () => {
  return (
    <div className="loading-infinite">
      <Spin tip="Loading..." />
    </div>
  );
};

const PostList = props => {
  return (
    <Query query={FEED_QUERY} variables={_getQueryVariables(props)}>
      {({ loading, error, data, fetchMore, subscribeToMore }) => {
        if (loading)
          return (
            <div
              style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Spin tip="Loading..." />
            </div>
          );
        if (error) return <div>Error loading feed</div>;

        _subscribeToNewPosts(subscribeToMore);
        _subscribeToNewLikes(subscribeToMore);

        const postsToRender = _getPostsToRender(data, props);

        const hasMore = data.feed.posts.length < data.feed.count;

        return (
          <InfiniteScroll
            loadMore={() => {
              fetchMore({
                variables: {
                  skip: postsToRender.length,
                  first: POSTS_PER_PAGE,
                  orderBy: 'createdAt_DESC'
                },
                updateQuery: (prev, { fetchMoreResult }) => {
                  if (!fetchMoreResult) return prev;
                  return Object.assign({}, prev, {
                    feed: {
                      ...prev.feed,
                      posts: [...prev.feed.posts, ...fetchMoreResult.feed.posts]
                    }
                  });
                }
              });
            }}
            hasMore={hasMore}
            loader={<Loader key="loading" />}
          >
            <Col span={16} offset={4}>
              {postsToRender.map((post, index) => (
                <Post
                  key={post.id}
                  post={post}
                  updateStoreAfterLike={(store, like, postId) =>
                    _updateCacheAfterLike(store, like, postId, props)
                  }
                />
              ))}
            </Col>
          </InfiniteScroll>
        );
      }}
    </Query>
  );
};

export default PostList;
