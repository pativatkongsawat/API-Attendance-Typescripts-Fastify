import bcrypt from 'bcrypt';

/**
 * Hash plain password using bcrypt
 * @param password - plain text password
 * @param saltRounds - default is 10
 * @returns hashed password
 */
export const hashPassword = async (password: string, saltRounds: number = 10): Promise<string> => {
  return await bcrypt.hash(password, saltRounds);
};
