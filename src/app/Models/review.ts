export interface Review {
  id: string;
  gameId: string;
  userId: string;
  msg: string;
  note: number;
  date: string;
  verified: boolean;
}