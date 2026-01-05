import React from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

const ApiDocs = () => {
  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI url="/api/docs/swagger.json" />
    </div>
  );
};

export default ApiDocs;
