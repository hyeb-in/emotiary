import { FieldPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { sql } from '../db/mysqlConnection';

export interface UserRow extends RowDataPacket {
  id: string;
  username: string;
  email: string;
  password: string;
  description: string | null;
  updatedAt: Date | string;
  createdAt: Date | string;
  latestEmoji: string | null;
  isFriend: number;
  alarmSetting: number;
  verificationToken: string | null;
  verificationTokenExpires: Date | string | null;
  isVerified: boolean | null;
}

export const createUser = async (inputData: any) => {
  const { id, username, hashedPassword, email } = inputData;
  await sql.execute(
    `INSERT INTO user (id, username, password, email)
      VALUES (? ,?, ?, ?)`,
    [id, username, hashedPassword, email],
  );
};

export const getUserById = async (id: string): Promise<UserRow> => {
  const [rows, fields] = (await sql.execute(`SELECT * FROM user WHERE id = ?`, [
    id,
  ])) as [UserRow[], FieldPacket[]];

  return rows[0];
};

export const getUserByEmail = async (email: string): Promise<UserRow> => {
  const [rows, fields] = (await sql.execute(
    `SELECT * FROM user WHERE email = '${email}'`,
  )) as [UserRow[], FieldPacket[]];

  return rows[0];
};
