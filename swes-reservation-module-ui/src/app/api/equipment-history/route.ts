import { NextResponse } from "next/server";
import { HistoryRow } from "@/lib/types";

const rows: HistoryRow[] = [
  { id:"H-1", date:"2025-12-28", itemName:"Winter Jacket", itemId:"ITM-1005", itemType:"Jacket", employeeName:"Lucie Kralova", employeeId:"120311", status:"Pending", returnDate:"2025-12-31" },
  { id:"H-2", date:"2025-12-20", itemName:"Kevlar Vest V2", itemId:"ITM-1002", itemType:"Vest", employeeName:"Petra Svobodova", employeeId:"120112", status:"Pending", returnDate:"2025-12-23" },
  { id:"H-3", date:"2025-12-12", itemName:"Safety Boots Pro", itemId:"ITM-1001", itemType:"Boots", employeeName:"Jan Novak", employeeId:"120034", status:"Returned", returnDate:"2025-12-15" },
  { id:"H-4", date:"2025-12-05", itemName:"Helmet Shield X", itemId:"ITM-1003", itemType:"Helmet", employeeName:"Martin Dvorak", employeeId:"120209", status:"Overdue", returnDate:"2025-12-08" },
  { id:"H-5", date:"2025-12-02", itemName:"Thermal Gloves", itemId:"ITM-1004", itemType:"Gloves", employeeName:"Jan Novak", employeeId:"120034", status:"Returned", returnDate:"2025-12-05" },
];

export async function GET() {
  await new Promise((r) => setTimeout(r, 550));
  return NextResponse.json({ rows });
}
