export interface Table {
  id: string;
  number: string;
  zone: string;
  capacity: number;
  orders: any[]; 
}

export interface BookingData {
  available_days: string[];
  current_day: string;
  tables: Table[];
}
