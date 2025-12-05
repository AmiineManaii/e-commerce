export interface User {
  id?: string;
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
  id?: string;
  userId?: string;
  nom: string;
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
  default?: boolean;
}

export interface Order {
  id?: string;
  userId: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  addressId: string;
}

export interface OrderItem {
  gameId: string;
  quantity: number;
  price: number;
}