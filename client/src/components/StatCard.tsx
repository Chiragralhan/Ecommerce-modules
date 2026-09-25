import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon,
  variant = 'primary',
}) => {
  const getBadgeClass = () => {
    switch (variant) {
      case 'success':
        return 'bg-success-subtle text-success';
      case 'warning':
        return 'bg-warning-subtle text-warning-emphasis';
      case 'danger':
        return 'bg-danger-subtle text-danger';
      case 'info':
        return 'bg-info-subtle text-info-emphasis';
      case 'secondary':
        return 'bg-secondary-subtle text-secondary';
      default:
        return 'bg-primary-subtle text-primary';
    }
  };

  return (
    <div className="card erp-card erp-stat-card h-100">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <span className="text-muted small text-uppercase fw-semibold">{title}</span>
          <h3 className="fw-bold my-1 text-dark">{value}</h3>
          {subtext && <div className="text-muted small">{subtext}</div>}
        </div>
        <div className={`stat-icon-wrapper ${getBadgeClass()}`}>{icon}</div>
      </div>
    </div>
  );
};
