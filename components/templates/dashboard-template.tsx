import React from 'react';
import { PageHeader } from '@/components/molecules/page-header';
import { PermissionGuard } from '@/components/atoms/permission-guard';

interface DashboardTemplateProps {
  header: React.ReactNode;
  stats: React.ReactNode;
  charts: React.ReactNode;
  table: React.ReactNode;
  modal?: React.ReactNode;
  permission?: string;
}

export const DashboardTemplate = ({
  header,
  stats,
  charts,
  table,
  modal,
  permission = "movements:view"
}: DashboardTemplateProps) => {
  return (
    <PermissionGuard permission={permission}>
      <div className="flex flex-col gap-8">
        {header}
        {stats}
        {charts}
        {table}
        {modal}
      </div>
    </PermissionGuard>
  );
};