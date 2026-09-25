import React from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📂',
  title,
  description,
  actionText,
  actionLink,
  onActionClick,
}) => {
  return (
    <div className="text-center py-5 px-3">
      <div style={{ fontSize: '3rem' }} className="mb-2">
        {icon}
      </div>
      <h5 className="fw-bold text-dark mb-1">{title}</h5>
      <p className="text-muted small mx-auto mb-3" style={{ maxWidth: '420px' }}>
        {description}
      </p>
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-sm btn-primary">
          {actionText}
        </Link>
      )}
      {actionText && onActionClick && !actionLink && (
        <button type="button" onClick={onActionClick} className="btn btn-sm btn-outline-primary">
          {actionText}
        </button>
      )}
    </div>
  );
};
