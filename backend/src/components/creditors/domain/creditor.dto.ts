export interface CreateCreditorDto {
  firstName: string;
  middleName?: string;
  lastName: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface UpdateCreditorDto extends Partial<CreateCreditorDto> {}

export interface CreditorResponseDto {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditorListDto {
  data: CreditorResponseDto[];
  total: number;
  page: number;
  limit: number;
}
