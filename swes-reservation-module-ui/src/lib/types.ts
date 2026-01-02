export type ItemType = "Boots" | "Vest" | "Helmet" | "Gloves" | "Jacket";
export type Status = "Returned" | "Pending" | "Overdue";

export type HistoryRow = {
  id: string;
  date: string;       // YYYY-MM-DD
  itemName: string;
  itemId: string;
  itemType: ItemType;
  employeeName: string;
  employeeId: string;
  status: Status;
  returnDate: string; // YYYY-MM-DD
};

export type Filters = {
  q: string;
  itemType: ItemType | "All";
  start: string; // YYYY-MM-DD or ""
  end: string;   // YYYY-MM-DD or ""
  status: { Returned: boolean; Pending: boolean; Overdue: boolean };
  sortKey: "date" | "itemName" | "status" | "returnDate";
  sortDir: "asc" | "desc";
  page: number;
  pageSize: 10 | 25 | 50;
};
