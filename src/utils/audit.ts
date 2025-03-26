import { AuditLog } from '../models';

export const logAuditEvent = async (
  userId: number,
  action: string,
  entityType: string,
  entityId: number,
  details?: string
): Promise<void> => {
  try {
    await AuditLog.create({
      userId,
      action,
      entityType,
      entityId,
      details: details || null
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}; 