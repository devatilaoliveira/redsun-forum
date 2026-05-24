export interface ResetPasswordWithCodeRequestDTO {
  email: string;
  code: string;
  newPassword: string;
}
