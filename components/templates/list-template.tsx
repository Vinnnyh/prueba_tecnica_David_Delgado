import React from 'react';
import { PermissionGuard } from '@/components/atoms/permission-guard';

interface ListTemplateProps {
  header: React.ReactNode;
  content: React.ReactNode;
  permission: string;
}

export const ListTemplate = ({
  header,
  content,
  permission,
}: ListTemplateProps) => {
  return (
    <PermissionGuard permission={permission}>
      <div className='flex flex-col gap-8'>
        {header}
        {content}
      </div>
    </PermissionGuard>
  );
};
