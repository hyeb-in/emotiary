import { FieldPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { sql } from '../db/mysqlConnection';

// export interface UserRow extends RowDataPacket {
//   id: string;
//   username: string;
//   email: string;
//   password: string;
//   description: string | null;
//   updatedAt: Date | string;
//   createdAt: Date | string;
//   latestEmoji: string | null;
//   isFriend: number;
//   alarmSetting: number;
//   verificationToken: string | null;
//   verificationTokenExpires: Date | string | null;
//   isVerified: boolean | null;
// }

export interface UserRow {
  id?: string;
  username?: string;
  email?: string;
  password?: string;
  description?: string | null;
  updatedAt?: Date | string;
  createdAt?: Date | string;
  latestEmoji?: string | null;
  isFriend?: number;
  alarmSetting?: number;
  verificationToken?: string | null;
  verificationTokenExpires?: Date | string | null;
  isVerified?: boolean | null;
}

export const createTempUser = async (id: string, email: string) => {
  const query = `INSERT INTO tempuser (id, email) VALUES (? , ?)`;
  await sql.execute(query, [id, email]);
};

export const updateTempUser = async (email: string) => {
  const query = `UPDATE tempuser SET verifiedTime = NOW() WHERE email = ?                                                                                                                                                         `;

  const [rows, fields] = (await sql.execute(query, [email])) as [
    UserRow[],
    FieldPacket[],
  ];
  return rows[0];
};
export const getTempUser = async (email: string) => {
  const query = `SELECT * FROM tempuser WHERE email = ?`;
  const [rows, fields] = (await sql.execute(query, [email])) as [
    UserRow[],
    FieldPacket[],
  ];
  return rows[0];
};

export const createUser = async (
  placeholders: string,
  processedQuery: string,
  values: any,
) => {
  const query = `INSERT INTO user (${processedQuery}) VALUES (${placeholders})`;
  await sql.execute(query, values);
};

export const updateUserRepository = async (
  placeholders: string,
  processedQuery: string,
  values: any,
) => {
  //로직
};
// export const createUser = async (inputData: any) => {
//   const { id, username, hashedPassword, email } = inputData;

//   const query = `INSERT INTO user (id, username, password, email)
//   VALUES (? ,?, ?, ?)`;
//   await sql.execute(query, [id, username, hashedPassword, email]);
// };

export const getUserById = async (id: string): Promise<UserRow> => {
  const query = `SELECT * FROM user WHERE id = ?`;
  const [rows, fields] = (await sql.execute(query, [id])) as [
    UserRow[],
    FieldPacket[],
  ];

  return rows[0];
};

export const getUserByEmail = async (email: string): Promise<UserRow> => {
  const query = `SELECT * FROM user WHERE email = ? `;
  const [rows, fields] = (await sql.execute(query, [email])) as [
    UserRow[],
    FieldPacket[],
  ];
  return rows[0];
};
