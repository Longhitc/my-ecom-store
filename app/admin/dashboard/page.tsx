import { db } from '@/lib/turso';

export const dynamic = 'force-dynamic';

interface StatItem {
  date: string;
  dayOfWeek: string;
  totalVisits: number;
  uniqueCustomers: number;
}

export default async function AdminDashboardPage() {
  const daysList: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
    daysList.push(dateStr);
  }

  const startDate = daysList[0] as string;
  const endDate = daysList[daysList.length - 1] as string;

  let stats: StatItem[] = [];
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          visit_date, 
          COUNT(id) as total_visits,
          COUNT(DISTINCT customer_id) as unique_customers
        FROM customer_visit_logs
        WHERE visit_date >= ? AND visit_date <= ?
        GROUP BY visit_date
      `,
      args: [startDate, endDate],
    });

    const statsMap = new Map();
    result.rows.forEach((row: any) => {
      statsMap.set(row.visit_date, {
        totalVisits: Number(row.total_visits || 0),
        uniqueCustomers: Number(row.unique_customers || 0),
      });
    });

    const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    stats = daysList.map((dateStr) => {
      const data = statsMap.get(dateStr) || { totalVisits: 0, uniqueCustomers: 0 };
      const [y, m, d] = dateStr.split('-');
      const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
      const dayOfWeek = dayNames[dateObj.getDay()] || 'Thứ';
      const formattedDate = `${d}/${m}`;

      return {
        date: formattedDate,
        dayOfWeek,
        ...data,
      };
    });
  } catch (err) {
    console.error('Lỗi load dashboard stats:', err);
  }

  const maxVal = Math.max(...stats.map((s) => s.totalVisits), 5);
  const svgWidth = 700;
  const svgHeight = 210; // Tăng nhẹ chiều cao để chứa nhãn bên dưới SVG
  
  const paddingX = 50; 
  const paddingY = 25;

  const usableWidth = svgWidth - paddingX * 2;
  const usableHeight = svgHeight - paddingY - 40; // Trừ phần dành cho nhãn chữ

  // Tính tọa độ khớp hoàn hảo 100% giữa chấm tròn và chữ
  const points = stats.map((item, index) => {
    const divider = stats.length > 1 ? stats.length - 1 : 1;
    const x = paddingX + (index / divider) * usableWidth;
    const y = paddingY + usableHeight - (item.totalVisits / maxVal) * usableHeight;
    return { x, y, ...item };
  });

  let pathD = '';
  if (points.length > 0) {
    const first = points[0];
    if (first) {
      pathD = 'M ' + first.x + ' ' + first.y;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        if (p0 && p1) {
          const cpX = (p0.x + p1.x) / 2;
          pathD += ' C ' + cpX + ' ' + p0.y + ', ' + cpX + ' ' + p1.y + ', ' + p1.x + ' ' + p1.y;
        }
      }
    }
  }

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaD = (points.length > 0 && lastPoint && firstPoint)
    ? pathD + ' L ' + lastPoint.x + ' ' + (paddingY + usableHeight) + ' L ' + firstPoint.x + ' ' + (paddingY + usableHeight) + ' Z'
    : '';

  const totalVisitsSum = stats.reduce((acc, curr) => acc + curr.totalVisits, 0);

  return (
    <div className="min-h-[calc(100vh-60px)] bg-neutral-950 p-3 sm:p-6 text-white overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-4">
        
        <div>
          <h1 className="text-lg sm:text-xl font-bold">📊 Thống kê Tần suất truy cập</h1>
          <p className="text-[11px] sm:text-xs text-neutral-400">Đánh giá lượng khách hàng quay lại website trong 7 ngày qua (GMT+7)</p>
        </div>

        <div className="relative rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 sm:p-5 shadow-xl space-y-4">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">7 ngày gần nhất</h2>
              <p className="text-base sm:text-lg font-extrabold text-white">
                {totalVisitsSum} <span className="text-xs font-normal text-neutral-400">lượt truy cập</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 bg-neutral-800/60 px-2.5 py-1 rounded-full border border-neutral-700/50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              <span>Live DB</span>
            </div>
          </div>

          <div className="relative w-full pt-2">
            <svg viewBox={'0 0 ' + svgWidth + ' ' + svgHeight} className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Các đường lưới ngang */}
              {[0, 0.5, 1].map((ratio, idx) => {
                const y = paddingY + usableHeight * ratio;
                const valLabel = Math.round(maxVal * (1 - ratio));
                return (
                  <g key={idx}>
                    <line 
                      x1={paddingX} 
                      y1={y} 
                      x2={svgWidth - paddingX} 
                      y2={y} 
                      stroke="#262626" 
                      strokeDasharray="4 4" 
                      strokeWidth="1" 
                    />
                    <text 
                      x={paddingX - 10} 
                      y={y + 3} 
                      fill="#737373" 
                      fontSize="9" 
                      textAnchor="end"
                    >
                      {valLabel}
                    </text>
                  </g>
                );
              })}

              {areaD && <path d={areaD} fill="url(#emeraldGradient)" />}

              {pathD && (
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* Các chấm tròn và nhãn thứ/ngày nằm CHUẨN XÁC 100% ngay dưới từng điểm */}
              {points.map((pt, idx) => (
                <g key={idx}>
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r="4" 
                    fill={pt.totalVisits > 0 ? "#ffffff" : "#171717"} 
                    stroke="#10b981" 
                    strokeWidth="2.5" 
                  />
                  {/* Nhãn Thứ nằm chuẩn ngay dưới chấm tròn */}
                  <text 
                    x={pt.x} 
                    y={paddingY + usableHeight + 20} 
                    fill="#d4d4d4" 
                    fontSize="10" 
                    fontWeight="600" 
                    textAnchor="middle"
                  >
                    {pt.dayOfWeek}
                  </text>
                  {/* Nhãn Ngày tháng nằm dưới chữ Thứ */}
                  <text 
                    x={pt.x} 
                    y={paddingY + usableHeight + 32} 
                    fill="#737373" 
                    fontSize="8" 
                    textAnchor="middle"
                  >
                    {pt.date}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* 7 ô thống kê nằm gọn hàng ngang bên dưới */}
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 pt-6">
            {stats.map((item, index) => (
              <div key={index} className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-2 text-center space-y-0.5">
                <p className="text-[10px] text-neutral-400 font-medium">{item.dayOfWeek} <span className="text-[9px] text-neutral-500">({item.date})</span></p>
                <p className="text-xs sm:text-sm font-bold text-white">{item.totalVisits} <span className="text-[9px] font-normal text-neutral-500">lượt</span></p>
                <p className="text-[9px] text-emerald-400 font-semibold">{item.uniqueCustomers} khách</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}