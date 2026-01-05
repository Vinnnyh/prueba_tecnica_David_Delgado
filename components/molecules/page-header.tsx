import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  rightElement?: React.ReactNode;
  icon?: React.ElementType;
  children?: React.ReactNode;
}

export const PageHeader = ({ title, description, rightElement, icon: Icon, children }: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="w-12 h-12 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-accent">
            <Icon size={24} />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
          {description && (
            <p className="text-gray-400 mt-1 font-medium">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {children}
        {rightElement}
      </div>
    </div>
  );
};
