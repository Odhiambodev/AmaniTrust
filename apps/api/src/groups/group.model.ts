export interface GroupModel {
  id: string;
  publicCode: string;
  name: string;
  type: 'CHAMA' | 'HARAMBEE';
  description?: string;
  ownerId: string;
  isPublic: boolean;
  trustScore: number;
}

export interface GroupMemberModel {
  id: string;
  userId: string;
  groupId: string;
  role: 'ADMIN' | 'TREASURER' | 'MEMBER';
  isActive: boolean;
}
