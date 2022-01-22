import { RequestHandler } from 'express';

import { Role, User } from '../models';
import { UserModel } from '../models/user.model';
import { genSkips } from '../helpers';

interface UserController {
  name: string;
  email: string;
  password: string;
  newPassword?: string;
  state?: boolean;
  role?: string;
}

interface UserUpdated {
  name: string;
  password: string;
  role?: string;
}

export const getUsers: RequestHandler = async (req, res) => {
  const { perPage = 5, pageNum = 1 } = req.query;
  const activeUsers = { state: true };

  // // 5 * (3 - 1) = 10 <- Salta    <-- Inicia   1, 6, 11
  // const skips = +perPage * (+pageNum - 1);
  const skips: number = genSkips(+perPage, +pageNum);

  const [users, total] = await Promise.all([
    User.find(activeUsers)
      .skip(skips)
      .limit(+perPage),

    User.find(activeUsers).count(),
  ]);

  return res.status(200).json({
    msg: 'All active users',
    total,
    users,
  });
};

export const getUserByID: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;

  const user: UserModel = await User.findById(id);

  return res.status(200).json({ msg: 'ok', user });
};

export const updateUser: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  if (req.body === {})
    return res.status(400).json({ msg: 'Nothing to update!' });

  const { password, newPassword, name, role }: UserController = req.body;
  const newUserData: UserUpdated = { name, password };

  const user: UserModel = await User.findById(id);
  const isValidRole = await Role.findOne({ role });

  // Only an admin can change role
  const { role: authRole } = req.user as UserUpdated;
  if (authRole === 'ADMIN_ROLE' && isValidRole?.role) newUserData.role = role;

  const matchPass = await user.comparePassword(password);
  if (!matchPass) return res.status(400).json({ msg: 'Incorrect password!' });

  if (newPassword)
    newUserData.password = await user.encryptNewPassword(newPassword);

  const updatedUser: UserModel = await User.findByIdAndUpdate(id, newUserData, {
    new: true,
  });

  return res.json({
    msg: 'User updated successfuly!',
    user: updatedUser,
  });
};

export const deleteUser: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;

  // Change user state in DB
  const userDeleted: UserModel = await User.findByIdAndUpdate(
    id,
    {
      state: false,
    },
    { new: true }
  );

  return res.status(200).json({
    msg: 'User successfully deleted!',
    userDeleted,
  });
};
