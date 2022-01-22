import { Request, Response } from 'express';

import { generateToken } from '../helpers';
import { User } from '../models';
import { UserModel } from '../models/user.model';

interface AuthRequestValues {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export const signUp = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, email, password, role }: AuthRequestValues = req.body;

  const newUser: UserModel = new User({ name, email, password, role });

  // Save in DB
  await newUser.save();

  return res
    .status(201)
    .json({ msg: 'Successfully registered user!', user: newUser });
};

export const signIn = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email }: AuthRequestValues = req.body;
  const user: UserModel = await User.findOne({ email });

  // Generate JWT
  const token = `JWT ${generateToken(user)}`;
  if (!token)
    return res
      .status(500)
      .json({ msg: 'Sorry, the token could not be generated.' });

  return res.status(200).json({ msg: 'Successful login!', token });
};
