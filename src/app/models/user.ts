export interface Roles {
  student?: boolean;
  officer?: boolean;
  moderator?: boolean;
  admin?: boolean;
}

export interface User {
  userId: string;
  userName: string;
  userEmail: string;
  bio: string;
  userSchoolId: string;
  userPhoto: string;
  role: Roles;
  roleName: string;
  createdAt: number;
}
