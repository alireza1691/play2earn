import React from 'react';
import './DualProgressBar.css'; // Add your own styles

interface DualProgressBarProps {
    amount: number
}

const ProgressBar: React.FC<DualProgressBarProps> = ({  amount }) => {
  const calculateWidth = (value: number) => {
    return `${value}%`;

  };

  return (
    <div className="dual-progress-bar">
      <div className="progress-bar secondary" style={{ width: calculateWidth(amount) }} />
    </div>
  );
};

export default ProgressBar;
