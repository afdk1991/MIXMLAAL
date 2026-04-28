const BASE_URL = '/api';

class RequestBase {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = '', timeout: number = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const fullURL = this.baseURL + url;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(fullURL, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(url + queryString, { method: 'GET' });
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' });
  }
}

const request = new RequestBase(BASE_URL);

export const login = (params: { username: string; password: string }) => {
  return request.post<{ token: string; user: any }>(`${BASE_URL}/auth/login`, params);
};

export const logout = () => {
  return request.post(`${BASE_URL}/auth/logout`);
};

export const getUserInfo = () => {
  return request.get<any>(`${BASE_URL}/auth/userinfo`);
};

export const getUserList = (params: { page?: number; pageSize?: number; username?: string }) => {
  return request.get<{ data: any[]; total: number }>(`${BASE_URL}/user/list`, params);
};

export const getUserById = (id: number) => {
  return request.get<any>(`${BASE_URL}/user/${id}`);
};

export const createUser = (data: any) => {
  return request.post<any>(`${BASE_URL}/user`, data);
};

export const updateUser = (data: any) => {
  return request.put<any>(`${BASE_URL}/user`, data);
};

export const deleteUser = (id: number) => {
  return request.delete<any>(`${BASE_URL}/user/${id}`);
};

export const resetUserPassword = (id: number, password: string) => {
  return request.put(`${BASE_URL}/user/resetPwd`, { userId: id, password });
};

export const changeUserStatus = (id: number, status: number) => {
  return request.put(`${BASE_URL}/user/changeStatus`, { userId: id, status });
};

export const getRoleList = (params?: { page?: number; pageSize?: number }) => {
  return request.get<{ data: any[]; total: number }>(`${BASE_URL}/role/list`, params);
};

export const getAllRoles = () => {
  return request.get<any[]>(`${BASE_URL}/role/all`);
};

export const createRole = (data: any) => {
  return request.post<any>(`${BASE_URL}/role`, data);
};

export const updateRole = (data: any) => {
  return request.put<any>(`${BASE_URL}/role`, data);
};

export const deleteRole = (id: number) => {
  return request.delete<any>(`${BASE_URL}/role/${id}`);
};

export const changeRoleStatus = (id: number, status: number) => {
  return request.put(`${BASE_URL}/role/changeStatus`, { roleId: id, status });
};

export const getPermissionList = (params?: any) => {
  return request.get<any>(`${BASE_URL}/permission/list`, params);
};

export const getMenuTree = () => {
  return request.get<any[]>(`${BASE_URL}/permission/menu`);
};

export const createPermission = (data: any) => {
  return request.post<any>(`${BASE_URL}/permission`, data);
};

export const updatePermission = (data: any) => {
  return request.put<any>(`${BASE_URL}/permission`, data);
};

export const deletePermission = (id: number) => {
  return request.delete<any>(`${BASE_URL}/permission/${id}`);
};

export const assignPermissions = (roleId: number, permissionIds: number[]) => {
  return request.post(`${BASE_URL}/role/assignPermissions`, { roleId, permissionIds });
};

export const getStatistics = () => {
  return request.get<any>(`${BASE_URL}/statistics`);
};

export const getDashboardData = () => {
  return request.get<any>(`${BASE_URL}/dashboard`);
};
