import {promisePool} from '../../database/db';
import CustomError from '../../classes/CustomError';
import {ResultSetHeader, RowDataPacket} from 'mysql2';
import {User} from '../../types/DBTypes';
import {MessageResponse} from '../../types/MessageTypes';

const getAllUsers = async (): Promise<User[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & User[]>(
    `
    SELECT user_id, user_name, email, role 
    FROM sssf_user
    `
  );
  if (rows.length === 0) {
    throw new CustomError('No users found', 404);
  }
  return rows;
};

const getUser = async (userId: number): Promise<User> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & User[]>(
    `
    SELECT user_id, user_name, email, role 
    FROM sssf_user 
    WHERE user_id = ?;
    `,
    [userId]
  );
  if (rows.length === 0) {
    throw new CustomError('No users found', 404);
  }
  return rows[0];
};

// TODO: create addUser function
const addUser = async (
  newUser: Omit<User, 'user_id'>
): Promise<MessageResponse> => {
  const {user_name, email, password, role} = newUser;
  const sql = promisePool.format(
    'INSERT INTO sssf_user (user_name, email, password, role) VALUES (?, ?, ?, ?);',
    [user_name, email, password, role]
  );
  try {
    const [headers] = await promisePool.execute<ResultSetHeader>(sql);

    if (headers.affectedRows === 0) {
      throw new CustomError('User not added', 400);
    }

    return {message: 'User added'};
  } catch (error) {
    // Handle any database-related errors
    throw new CustomError('Error adding user', 500);
  }
};

const updateUser = async (
  data: Partial<User>,
  userId: number
): Promise<MessageResponse> => {
  const sql = promisePool.format('UPDATE sssf_user SET ? WHERE user_id = ?;', [
    data,
    userId,
  ]);
  const [headers] = await promisePool.execute<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('No users updated', 400);
  }
  return {message: 'User updated'};
};

// TODO: create deleteUser function
const deleteUser = async (userId: number): Promise<MessageResponse> => {
  const sql = promisePool.format('DELETE FROM sssf_user WHERE user_id = ?;', [
    userId,
  ]);

  try {
    const [headers] = await promisePool.execute<ResultSetHeader>(sql);

    if (headers.affectedRows === 0) {
      throw new CustomError('No user deleted', 404);
    }

    return {message: 'User deleted'};
  } catch (error) {
    // Handle any database-related errors
    throw new CustomError('Error deleting user', 500);
  }
};

const getUserLogin = async (email: string): Promise<User> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & User[]>(
    `
    SELECT * FROM sssf_user 
    WHERE email = ?;
    `,
    [email]
  );
  if (rows.length === 0) {
    throw new CustomError('Invalid username/password', 200);
  }
  return rows[0];
};

export {getAllUsers, getUser, addUser, updateUser, deleteUser, getUserLogin};
