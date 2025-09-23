export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  googleSub?: string;
  createdAt: string;
  updatedAt: string;
  address?: string;
}

export interface AuthResponse {
  isAdmin: boolean;
  token: string;
}

export interface GoogleAuthResponse {
  isAdmin: boolean;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DatabaseStatus {
  status: string;
  version: string;
  uptime: number;
}

export interface FileUploadResponse {
  url: string;
  success: boolean;
  error?: string;
}