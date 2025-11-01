import { Game } from './game.model';

export interface CartItem {
  id: number;
  game: Game;
  quantity: number;
  subtotal: number;
  createdAt: string;
}

export interface CartSummary {
  subtotal: number;
  shippingFee: number;
  total: number;
  itemCount: number;
}

