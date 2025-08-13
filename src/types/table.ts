export interface Table {
  id: string;
  number: string;
  zone: string;
  capacity: number;
  orders: any[];
  reservations: any[];
}

export interface Restaurant {
  id: number;
  restaurant_name: string;
  opening_time: string;
  closing_time: string;
  timezone: string;
}

export interface BookingData {
  available_days: string[];
  current_day: string;
  restaurant: Restaurant;
  tables: Table[];
}
