export interface Game {
  id: number;
  title: string;
  platform: string;       
  genre: string;          
  price: number;
  rating: number;         
  release_date: string;   
  stock: number;          
  description: string;
  cover_image: string;    
  images: string[];       
  promo?: boolean;        
  tags?: string[];
}


export enum Platform {
  PC = 'PC',
  PlayStation5 = 'PlayStation 5',
  Xbox = 'Xbox',
  NintendoSwitch = 'Nintendo Switch',
  PlayStation4 = 'PlayStation 4',
  XboxOne = 'Xbox One',
  Mobile = 'Mobile'
}


export enum Genre {
  Action = 'Action',
  RPG = 'RPG',
  Sport = 'Sport',
  Adventure = 'Adventure',
  Strategy = 'Strategy',
  FPS = 'FPS',
  Racing = 'Racing',
  Horror = 'Horror',
  Simulation = 'Simulation',
  Fighting = 'Fighting'
}