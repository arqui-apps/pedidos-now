'use client';

import { useEffect, useRef } from 'react';
import SwaggerUI from 'swagger-ui-dist/swagger-ui-bundle.js';
import 'swagger-ui-dist/swagger-ui.css';

export default function DocsPage() {
  const swaggerRef = useRef(null);

  useEffect(() => {
    if (!swaggerRef.current) return;

    SwaggerUI({
      domNode: swaggerRef.current,
      url: '/api/openapi',
    });
  }, []);

  return (
    <main style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '16px' }}>Documentación API - Chat Service</h1>
      <div ref={swaggerRef} />
    </main>
  );
}