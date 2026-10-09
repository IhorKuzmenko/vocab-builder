export interface AuthUser {
  name: string;
  email: string;
}

export interface AuthResponse extends AuthUser {
  token: string;
}

export interface CurrentUser extends AuthUser {
  _id: string;
  token?: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}
