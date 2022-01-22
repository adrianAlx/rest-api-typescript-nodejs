import { Role, User } from '../models';

interface CheckModel {
  state: boolean;
  name: string;
}

// User:
export const isValidRole = async (role: string): Promise<void> => {
  const roleExist = await Role.findOne({ role });
  if (!roleExist)
    throw new Error(`The role: '${role}' is not valid in this app.`);
};

export const alreadyRegistered = async (
  query: string,
  collection: string
): Promise<void> => {
  let model: CheckModel;

  const checkInCollection = (): void => {
    if (model)
      throw new Error(
        `The ${collection}${
          query.includes('@') ? "'s email" : ' name'
        } is already registered!`
      );
  };

  switch (collection) {
    case 'user':
      model = await User.findOne({ email: query });
      return checkInCollection();
  }
};

export const doesItExist = async (
  id: string,
  collection: string
): Promise<void> => {
  let model: CheckModel;

  const checkInCollection = (): void => {
    if (!model)
      throw new Error(`${collection} ID: '${id}' doesn't exist! - in Db`);
    if (!model.state)
      throw new Error(
        `${collection} ID: '${id}' doesn't exist! - State: False`
      );
  };

  // Search by ID
  switch (collection) {
    case 'user':
      model = await User.findById(id);
      return checkInCollection();
  }
};