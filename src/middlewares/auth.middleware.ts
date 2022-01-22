import { Handler, RequestHandler } from 'express';
import passport from 'passport';
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from 'passport-jwt';

import { SECRETORKEY } from '../config';
import { User } from '../models';
import { UserModel } from '../models/user.model';

interface LoginCredentials {
  email: string;
  password: string;
}

export const initializePassport = (): Handler => passport.initialize();

export const passportInit = (): void => {
  const opts: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
    secretOrKey: SECRETORKEY,
  };

  passport.use(
    new JwtStrategy(opts, async (payload, done) => {
      try {
        const user: UserModel | null = await User.findById(payload.id);
        if (!user || !user.state) return done(null, false);

        // req.user: 2nd parameter
        return done(null, user);
      } catch (error) {
        console.log(error);
      }
    })
  );
};

export default passport.authenticate('jwt', { session: false });

export const checkLoginCredentials: RequestHandler = async (req, res, next) => {
  const { email, password }: LoginCredentials = req.body;

  const user: UserModel = await User.findOne({ email });
  const matchPass: boolean = await user?.comparePassword(password);

  if (!user || !user.state || !matchPass)
    return res.status(400).json({
      msg: 'There was a problem logging in. Check your email and password or create an account.',
    });

  return next();
};
