import * as jwt from 'jsonwebtoken';
import { ApolloError } from 'apollo-server';

export const APP_SECRET = 'TOPSECRETKEY';

export function getUserId(context) {
  try {
    const Authorization = context.req.get('Authorization');
    if (Authorization) {
      const token = Authorization.replace('Bearer ', '');
      const { userId } = jwt.verify(token, APP_SECRET) as { userId: string };
      return userId;
    }

    throw new ApolloError('Not authenticated');
  } catch (error) {
    throw new ApolloError(error);
  }
}
