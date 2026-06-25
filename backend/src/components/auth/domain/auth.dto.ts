export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  user: {
    id: string;
    username: string;
    role: string;
  };
  accessToken: string;
}

export interface RefreshResponseDto {
  accessToken: string;
}

export interface RegisterRequestDto {
  username: string;
  password: string;
  email?: string;
}
