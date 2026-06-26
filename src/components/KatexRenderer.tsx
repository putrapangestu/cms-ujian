import { useMemo } from 'react';
import katex from 'katex';

type KatexRendererProps = {
  content: string;
  displayMode?: boolean;
};

/**
 * Render konten yang mengandung LaTeX ($...$ atau $$...$$) menggunakan KaTeX.
 *
 * Contoh:
 *   "Hitung $\int_0^1 x^2 dx$"
 *   "Rumus: $$\frac{-b \pm \sqrt{b^2-4ac}}{2a}$$"
 */
export default function KatexRenderer({ content }: KatexRendererProps) {
  const html = useMemo(() => {
    if (!content) return '';

    try {
      return autoRenderLatex(content);
    } catch (e) {
      console.warn('KaTeX auto-render error:', e);
      return escapeHtml(content);
    }
  }, [content]);

  return (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}

function autoRenderLatex(text: string): string {
  // Render $$...$$ (display mode) dulu
  let result = text.replace(/\$\$(.+?)\$\$/gs, (_match: string, latex: string) => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      return `$$${latex}$$`;
    }
  });

  // Lalu render $...$ (inline mode)
  result = result.replace(/\$(.+?)\$/g, (_match: string, latex: string) => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return `$${latex}$`;
    }
  });

  return result;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
