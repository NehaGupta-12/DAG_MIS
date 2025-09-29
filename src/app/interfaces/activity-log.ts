export interface ActivityLog {
  action: string;
  currentIp: string;
  date: number;          // Timestamp in milliseconds
  description: string;
  section: string;
}
