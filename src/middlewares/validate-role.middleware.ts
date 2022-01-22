import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongoose';

interface UserRole {
  role: string;
  name: string;
  _id: ObjectId;
}

export const isAdminOrSameUser = (collection: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ msg: 'Unathorized!!' });

    const { id: documentID } = req.params;
    const { role: authRole, name, _id: authUid } = req.user as UserRole;

    switch (collection) {
      case 'user':
        if (documentID === authUid.toString() || authRole === 'ADMIN_ROLE')
          return next();
        return res.status(401).json({
          msg: `Unauthorized! - '${name}' is not an admin or the same user.`,
        });
    }
  };
};

export const hasValidRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user)
      return res.status(401).json({
        msg: 'Unathorized! - You want to verify the role without validating the token first',
      });

    const { role: authRole, name } = req.user as UserRole;
    if (!roles.includes(authRole))
      return res
        .status(401)
        .json({ msg: `Unauthorized! - '${name}' has no valid role!` });

    return next();
  };
};
