export interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  adresse: string;
  adresses?: Address[];
  wishlist?: number[];
  cart?: number[];
}

export interface Address {
  id?: number;
  userId?: number;
  nom: string;
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
  default?: boolean;
}

export interface Order {
  id?: number;
  userId: number;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  addressId: number;
}

export interface OrderItem {
  gameId: number;
  quantity: number;
  price: number;
}