import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrajectoryPoint {
  week: number;
  month: number;
  cumulative_hours: number;
  predicted_readiness: number;
  is_job_ready: boolean;
}

interface TrajectoryChartProps {
  points: TrajectoryPoint[];
}

export const TrajectoryChart: React.FC<TrajectoryChartProps> = ({ points }) => {
  const labels = points.map((p) => (p.week === 0 ? 'Now' : `Week ${p.week}`));
  const scores = points.map((p) => p.predicted_readiness);
  const readyThreshold = points.map(() => 75);

  const data = {
    labels,
    datasets: [
      {
        label: 'Predicted Readiness (%)',
        data: scores,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.18)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#818cf8',
        pointBorderColor: '#ffffff',
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 3,
      },
      {
        label: 'Job-Ready Threshold (75%)',
        data: readyThreshold,
        borderColor: '#10b981',
        borderDash: [6, 6],
        pointRadius: 0,
        fill: false,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9ca3af', font: { weight: 600 as const } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#9ca3af',
          callback: (value: any) => `${value}%`,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#e5e7eb',
          font: { size: 12, weight: 600 as const },
        },
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#f3f4f6',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const idx = context.dataIndex;
            const pt = points[idx];
            if (context.datasetIndex === 0 && pt) {
              return ` Readiness: ${pt.predicted_readiness}% | Cum. Hours: ${pt.cumulative_hours} hrs`;
            }
            return ` ${context.dataset.label}`;
          },
        },
      },
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '320px' }}>
      <Line data={data} options={options} />
    </div>
  );
};
