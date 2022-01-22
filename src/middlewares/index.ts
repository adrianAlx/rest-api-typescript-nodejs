import notFoundMiddleware from './not-found.middleware';
import protectWithJWT from './auth.middleware';

export { notFoundMiddleware, protectWithJWT };
export * from './auth.middleware';
export * from './setup.middleware';
export * from './validate-fields.middleware';
