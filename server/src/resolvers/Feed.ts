function posts(parent, args, context, info) {
  const { postIds, orderBy } = parent;
  const where = { id_in: postIds };
  return context.db.query.posts({ where, orderBy }, info);
}

export default { posts };
