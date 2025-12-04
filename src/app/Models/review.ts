import { Game } from "./game.model";
import { User } from "./user.model";

export interface Review {
  id: string;
  game: Game;
  user: User;
  msg: string;
  note: number;
  date: string;
  verified: boolean;
}