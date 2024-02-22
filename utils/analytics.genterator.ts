//STEP: 102
//in order to understand this code, watch- 7:45:00 to 7:48:45
import { Document,Model } from "mongoose";
interface MonthData{
    month: string;
    count: number;
}
export async function generateLast12MonthsData<T extends Document>(
    model: Model<T>
): Promise<{ last12Months:MonthData[] }>{
    const last12Months:MonthData[] = [];
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    for(let i=11; i>=0; i--){
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - i * 28);
        const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 28);
        const monthYear = endDate.toLocaleString('default', {day:"numeric", month:"short", year:"numeric"});
        const count = await model.countDocuments({
            createdAt: {
                $gte: startDate,
                $lt: endDate,
            }
        });
        last12Months.push({month: monthYear, count});
    }
    return {last12Months};
}
//OVER: 102("c": ../controller/analytics.controller.ts and "m": ../controller/analytics.controller.ts)