
import React from 'react';
import './DualProgressBar.css'; // Add your own styles

interface DualProgressBarProps {
    amount: number
}

const CapacityProgressBar: React.FC<DualProgressBarProps> = ({  amount }) => {
  const calculateWidth = (value: number) => {
    return `${value}%`;

  };

  return (
    <div className="dual-progress-bar !h-[14px]">
      <div className="progress-bar !bg-[#98DDFB] " style={{ width: calculateWidth(amount) }} />
    </div>
  );
};

export default CapacityProgressBar;
