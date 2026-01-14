export interface Group {
  _id: string;
  name: string;
  description: string;
  members: [];
  isJoined: boolean;
  createdAt: string;
  updatedAt: string;
}
