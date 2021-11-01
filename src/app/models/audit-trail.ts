export interface AuditTrail {
  auditId: string;
  userId: string;
  userName: string;
  userSurname: string;
  userEmail: string;
  userSchoolId: string
  action: string;
  createdAt: number;
}
