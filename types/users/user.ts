export interface CreateUserInput {
  user_id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  department: string;
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  is_active?: boolean;
}

export interface CurrentUser {
  id: number;
  email: string;
  user_id :string
  roles: { id: number; name: string }[];
}