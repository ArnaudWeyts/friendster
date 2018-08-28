import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import { gql } from 'apollo-boost';
import { Input } from 'antd';

import Post from './Post';

const AntdSearch = Input.Search;

const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($term: String!) {
    feed(filter: $term) {
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
        }
      }
    }
  }
`;

class Search extends Component {
  state = {
    term: '',
    posts: null
  };

  async _executeSearch(term) {
    const result = await this.props.client.query({
      query: FEED_SEARCH_QUERY,
      variables: { term }
    });
    const { posts } = result.data.feed;
    this.setState({ posts });
  }

  render() {
    const { posts } = this.state;
    return (
      <div>
        <AntdSearch
          style={{ marginTop: 10 }}
          placeholder="Search for posts..."
          onSearch={term => this._executeSearch(term)}
          enterButton
        />
        {!posts && <p>Enter a search term above</p>}
        {posts &&
          posts.length === 0 && <p>Sorry, no posts found for that term!</p>}
        {posts &&
          posts.length > 0 &&
          posts.map((post, index) => (
            <Post key={post.id} post={post} index={index} />
          ))}
      </div>
    );
  }
}

export default withApollo(Search);
