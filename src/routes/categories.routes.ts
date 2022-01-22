import { Router } from 'express';
import { check } from 'express-validator';

import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from '../controllers';
import { alreadyRegistered, doesItExist } from '../helpers';
import { CACHE_TIME } from '../config';
import {
  cacheMiddleware,
  checkNewName,
  isAdminOrSameUser,
  protectWithJWT,
  validateFields,
} from '../middlewares';

const router: Router = Router();

router
  .route('/')
  .get(cacheMiddleware(CACHE_TIME.ONE_HOUR), getCategories)
  .post(
    [
      protectWithJWT,
      check('name', 'Category name is required!').exists(),
      check('name').custom(name => alreadyRegistered(name, 'category')),
      validateFields,
    ],

    createCategory
  );

router
  .route('/:id')
  .get(
    [
      check('id', 'Invalid MongoDB ID!').isMongoId(),
      check('id').custom((id: string) => doesItExist(id, 'category')),
      validateFields,
    ],

    getCategory
  )
  .put(
    [
      protectWithJWT,
      check('id', 'Invalid ID!').isMongoId(),
      check('newName', 'New name is required!').exists(),
      check('id').custom((id: string) => doesItExist(id, 'category')),
      validateFields,
      isAdminOrSameUser('category'),
      validateFields,
      checkNewName('category'),
      validateFields,
    ],

    updateCategory
  )
  .delete(
    [
      protectWithJWT,
      isAdminOrSameUser('category'),
      check('id', 'Invalid ID!').isMongoId(),
      check('id').custom((id: string) => doesItExist(id, 'category')),
      validateFields,
      isAdminOrSameUser('category'),
      validateFields,
    ],

    deleteCategory
  );

export default router;
