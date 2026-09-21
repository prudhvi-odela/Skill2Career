import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface SkillRadarProps {
  labels: string[];
  studentLevels: number[];
  requiredLevels: number[];
}

export const RadarChart: React.FC<SkillRadarProps> = ({ labels, studentLevels, requiredLevels }) => {
  const data = {
    labels,
    datasets: [
      {
        label: 'Student Level',
        data: studentLevels,
        backgroundColor: 'rgba(30, 58, 138, 0.15)',
        borderColor: '#1e3a8a',
        borderWidth: 2,
        pointBackgroundColor: '#1e3a8a',
        pointBorderColor: '#f8f9fa',
        pointHoverBackgroundColor: '#f8f9fa',
        pointHoverBorderColor: '#1e3a8a',
      },
      {
        label: 'Role Target Level',
        data: requiredLevels,
        backgroundColor: 'rgba(71, 85, 105, 0.08)',
        borderColor: '#475569',
        borderWidth: 2,
        borderDash: [4, 4],
        pointBackgroundColor: '#475569',
        pointBorderColor: '#f8f9fa',
        pointHoverBackgroundColor: '#f8f9fa',
        pointHoverBorderColor: '#475569',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: '#cbd5e1' },
        grid: { color: '#e2e8f0' },
        pointLabels: {
          color: '#1e293b',
          font: { size: 11, weight: 600 as const },
        },
        ticks: {
          backdropColor: 'transparent',
          color: '#64748b',
          stepSize: 1,
          min: 0,
          max: 5,
        },
        suggestedMin: 0,
        suggestedMax: 5,
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
      },
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '320px' }}>
      <Radar data={data} options={options} />
    </div>
  );
};
