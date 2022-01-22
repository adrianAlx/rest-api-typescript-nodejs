import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Types } from 'mongoose';

import { Category, Product, User } from './../models';
import { CategoryModel } from '../models/category.model';

const { ObjectId } = Types;

interface CheckModel {
  state: boolean;
  name: string;
}

interface ModelCheckCollection {
  state: boolean;
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

      case 'product':
        model = await Product.findById(id);
        isRegistered = await Product.findOne({
          name: newName.toLowerCase(),
        });
        return checkInCollection();
    }
  };
};

export const idExistSearch: RequestHandler<{
  collection: string;
  query: string;
}> = async (req, res, next) => {
  const { collection, query } = req.params;
  const isValidMongoId: boolean = ObjectId.isValid(query);
  if (!isValidMongoId) return next();

  let model: ModelCheckCollection;

  const checkInCollection = () =>
    res.json({
      results: model && model.state ? [model] : [],
    });

  switch (collection) {
    case 'user':
      model = await User.findById(query);
      return checkInCollection();

    case 'category':
      model = await Category.findById(query);
      return checkInCollection();

    case 'product':
      model = await Product.findById(query);
      return checkInCollection();
  }
};
