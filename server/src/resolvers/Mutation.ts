import { ApolloError, UserInputError } from 'apollo-server';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { APP_SECRET, getUserId } from '../utils';

async function signup(root, args, context, info) {
  // Encrypt user password
  const password = await bcrypt.hash(args.password, 10);
  // User Prisma to create user and return the user id
  const user = await context.db.mutation.createUser(
    { data: { ...args, password } },
    `{ id }`
  );

  // Sign a token for the user with jwt and app secret
  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return { token, user };
}

async function login(parent, args, context, info) {
  try {
    // Retrieve the existing user's id and password using their email
    const user = await context.db.query.user(
      { where: { email: args.email } },
      ` { id password } `
    );

    // If no user was found, throw an error
    if (!user) {
      throw new UserInputError('No such user found');
    }

    // Check if the entered password hash matches the returned one
    const valid = await bcrypt.compare(args.password, user.password);
    if (!valid) {
      throw new ApolloError('Invalid password');
    }

    // Signe a token with jwt and app secret
    const token = jwt.sign({ userId: user.id }, APP_SECRET);

    return {
      token,
      user
    };
  } catch (error) {
    throw new ApolloError(error);
  }
}

function createPost(parent, args, context, info) {
  const userId = getUserId(context);
  return context.db.mutation.createPost(
    {
      data: {
        body: args.body,
        author: { connect: { id: userId } }
      }
    },
    info
  );
}

async function deletePost(parent, { id }, ctx, info) {
  try {
    const userId = getUserId(ctx);

    // Get author of post
    const post = await ctx.db.query.post(
      { where: { id } },
      ` { author { id } } `
    );

    if (!post) {
      return new ApolloError('Post not found');
    }

    // Check if user is authorized to delete this post
    if (post.author.id !== userId) {
      return new ApolloError('Unauthorized to delete post');
    }

    return ctx.db.mutation.deletePost(
      {
        where: { id }
      },
      info
    );
  } catch (error) {
    throw new ApolloError(error);
  }
}

async function like(parent, args, context, info) {
  try {
    const userId = getUserId(context);

    const likeExists = await context.db.exists.Like({
      user: { id: userId },
      post: { id: args.postId }
    });

    if (likeExists) {
      throw new ApolloError(`Already liked post with id: ${args.postId}`);
    }

    return context.db.mutation.createLike(
      {
        data: {
          user: { connect: { id: userId } },
          post: { connect: { id: args.postId } }
        }
      },
      info
    );
  } catch (error) {
    throw new ApolloError(error);
  }
}

function follow(parent, args, ctx, info) {
  const userId = getUserId(ctx);

  // update the user who's being followed
  ctx.db.mutation.updateUser({
    where: {
      id: args.id
    },
    data: {
      followers: {
        connect: {
          id: userId
        }
      }
    }
  });

  // update the user who's following
  return ctx.db.mutation.updateUser(
    {
      where: {
        id: userId
      },
      data: {
        following: {
          connect: {
            id: args.id
          }
        }
      }
    },
    info
  );
}

async function unfollow(parent, args, ctx, info) {
  const userId = getUserId(ctx);

  // update the user who's being followed
  ctx.db.mutation.updateUser(
    {
      where: { id: args.id },
      data: { followers: { disconnect: { id: userId } } }
    },
    info
  );

  // update the user who's unfollowing
  return ctx.db.mutation.updateUser(
    {
      where: { id: userId },
      data: { following: { disconnect: { id: args.id } } }
    },
    info
  );
}

export default {
  signup,
  login,
  createPost,
  deletePost,
  like,
  follow,
  unfollow
};
