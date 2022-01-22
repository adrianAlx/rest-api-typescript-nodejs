import { Request, Response, NextFunction } from 'express';

import { Category } from './../models';
import { CategoryModel } from '../models/category.model';

interface CheckModel {
  state: boolean;
  name: string;
}

export const checkNewName = (collection: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { newName } = req.body as { newName: string };
    let model: CheckModel;
    let isRegistered: CategoryModel;

    const checkInCollection = () => {
      if (model.name.toLowerCase() === newName.toLowerCase())
        return res.status(400).json({ msg: 'New name must not be the same!' });

      if (isRegistered)
        return res.status(400).json({
          msg: `The ${collection} '${newName}' is already registered!`,
        });

      return next();
    };

    switch (collection) {
      case 'category':
        model = await Category.findById(id);
        isRegistered = await Category.findOne({
          name: newName.toUpperCase(),
        });
        return checkInCollection();
    }
  };
};
