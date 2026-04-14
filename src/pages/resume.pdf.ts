import type { APIRoute } from 'astro';
import { renderToBuffer } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import { createElement } from 'react';
import type { ReactElement } from 'react';
import { ResumePDF } from '../components/ResumePDF';
import resume from '../data/resume.json';

export const GET: APIRoute = async () => {
  const element = createElement(ResumePDF, { resume }) as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="nathan-pickard-resume.pdf"',
    },
  });
};
