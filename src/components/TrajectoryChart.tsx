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
        borderColor: '#1e3a8a',
        backgroundColor: 'rgba(30, 58, 138, 0.08)',
        fill: true,
        tension: 0.2,
        pointBackgroundColor: '#1e3a8a',
        pointBorderColor: '#f8f9fa',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
      {
        label: 'Job-Ready Benchmark (75%)',
        data: readyThreshold,
        borderColor: '#15803d',
        borderDash: [6, 4],
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
        grid: { color: '#e2e8f0' },
        ticks: { color: '#475569', font: { weight: 600 as const } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: '#e2e8f0' },
        ticks: {
          color: '#475569',
          callback: (value: any) => `${value}%`,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#0f172a',
          font: { size: 12, weight: 600 as const },
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8f9fa',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
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
