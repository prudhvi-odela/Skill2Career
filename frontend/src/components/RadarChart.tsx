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
        label: 'Your Current Level',
        data: studentLevels,
        backgroundColor: 'rgba(99, 102, 241, 0.35)',
        borderColor: '#6366f1',
        borderWidth: 2,
        pointBackgroundColor: '#818cf8',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#6366f1',
      },
      {
        label: 'Role Target Level',
        data: requiredLevels,
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        borderColor: '#06b6d4',
        borderWidth: 2,
        borderDash: [4, 4],
        pointBackgroundColor: '#22d3ee',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#06b6d4',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        pointLabels: {
          color: '#d1d5db',
          font: { size: 11, weight: 600 as const },
        },
        ticks: {
          backdropColor: 'transparent',
          color: '#9ca3af',
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
      },
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '320px' }}>
      <Radar data={data} options={options} />
    </div>
  );
};
