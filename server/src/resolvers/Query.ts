function info() {
  return 'This is the API for Friendster, a Facebook/Instagram clone';
}

function user(root, args, ctx, info) {
  return ctx.db.query.user({ where: { id: args.id } }, info);
}

function feed(root, args, ctx, info) {
  return feedFiltering(args, ctx);
}

function feedForUser(root, args, ctx, info) {
  return feedFiltering(args, ctx);
}

async function feedFiltering(args, ctx) {
  // Filter posts for content
  const whereWithFilter = args.filter
    ? {
        OR: [{ body_contains: args.filter }]
      }
    : {};

  // Filter posts to a user id
  const where = args.userId
    ? { ...whereWithFilter, author: { id: args.userId } }
    : { ...whereWithFilter };

  const queriedPosts = await ctx.db.query.posts(
    { where, skip: args.skip, first: args.first, orderBy: args.orderBy },
    `{ id }`
  );

  const countSelectionSet = `
    {
      aggregate {
        count
      }
    }
  `;

  const postsConnection = await ctx.db.query.postsConnection(
    {},
    countSelectionSet
  );

  return {
    count: postsConnection.aggregate.count,
    postIds: queriedPosts.map(post => post.id),
    orderBy: args.orderBy || 'createdAt_DESC'
  };
}

export default { info, user, feed, feedForUser };
