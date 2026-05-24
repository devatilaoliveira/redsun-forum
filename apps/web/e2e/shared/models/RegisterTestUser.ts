export interface RegisterTestUser {
  email: string;
  password: string;
  markForCleanup: () => void;
}
