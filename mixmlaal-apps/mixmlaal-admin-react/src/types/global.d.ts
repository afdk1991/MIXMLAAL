export interface User {
  id: number;
  username: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  status: number;
  createTime: string;
  roles?: Role[];
}

export interface Role {
  id: number;
  code: string;
  name: string;
  description?: string;
  status: number;
  createTime: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  code: string;
  name: string;
  type: 'button' | 'menu' | 'api';
  path?: string;
  icon?: string;
  parentId?: number;
  sort: number;
  createTime: string;
}

export interface LoginParams {
  username: string;
  password: string;
  code?: string;
  uuid?: string;
}

export interface LoginResult {
  token: string;
  tokenType?: string;
  expiresIn?: number;
  user: User;
}

export interface PageResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}
