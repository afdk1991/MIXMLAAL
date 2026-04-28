export interface User {
  id: number;
  username: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  status: number;
  createTime: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: User;
}

export interface Role {
  id: number;
  code: string;
  name: string;
  description?: string;
  status: number;
  createTime: string;
}

export interface Permission {
  id: number;
  code: string;
  name: string;
  type: string;
  path?: string;
  icon?: string;
  parentId?: number;
  sort: number;
  createTime: string;
}
