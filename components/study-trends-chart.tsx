'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type ChartDataPoint = {
  name: string
  hours: number
}

export function StudyTrendsChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
        <defs>
          <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
          dy={10}
          minTickGap={30}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
          tickFormatter={(value) => `${value}h`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.9)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '12px', 
            color: '#fff',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
          }}
          itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
          formatter={(value: any) => [`${value} hours`, 'Study Time']}
          labelStyle={{ color: '#cbd5e1', marginBottom: '4px' }}
        />
        <Area 
          type="monotone" 
          dataKey="hours" 
          stroke="#2563EB" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorHours)" 
          activeDot={{ r: 6, fill: '#0284C7', stroke: '#fff', strokeWidth: 2, className: 'shadow-[0_0_15px_#0284C7]' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
