import { request } from '@umijs/max';

export async function login(params: { username: string; password: string }) {
  return request<API.LoginResult>('/auth/login', {
    method: 'POST',
    data: params,
  });
}

export async function getUserInfo() {
  return request<API.User>('/auth/userinfo', {
    method: 'GET',
  });
}

export async function logout() {
  return request('/auth/logout', {
    method: 'POST',
  });
}

export async function getUserList(params: any) {
  return request<{ data: API.User[]; total: number }>('/user/list', {
    method: 'GET',
    params,
  });
}

export async function createUser(data: any) {
  return request('/user/create', {
    method: 'POST',
    data,
  });
}

export async function updateUser(data: any) {
  return request('/user/update', {
    method: 'POST',
    data,
  });
}

export async function deleteUser(id: number) {
  return request(`/user/delete/${id}`, {
    method: 'DELETE',
  });
}

export async function getRoleList(params: any) {
  return request<{ data: API.Role[]; total: number }>('/role/list', {
    method: 'GET',
    params,
  });
}

export async function getPermissionList(params?: any) {
  return request<{ data: API.Permission[]; total: number }>('/permission/list', {
    method: 'GET',
    params,
  });
}
