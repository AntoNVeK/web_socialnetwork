export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  middleName?: string;
  birthDate?: string;
  photo?: string | null;
  role?: string;
  status?: string;
}
