import React from 'react';
import { ProspectReport } from '../types';
import LinkList from './LinkList';

interface ProspectResultProps {
  report: ProspectReport | null;
}

const ProspectResult: React.FC<ProspectResultProps> = ({ report }) => {
  if (!report || !report.text) {
    return null;
  }

  // Basic Markdown rendering by converting newlines to <br> and bolding with <strong>
  // This is a minimal implementation to adhere to "no external markdown libs" constraint.
  const renderMarkdown = (markdownText: string) => {
    // Replace markdown headings with appropriate HTML tags
    let html = markdownText
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Replace bold text (e.g., **text** or __text__)
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');

    // Replace bullet points (basic support for - or *)
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    if (html.includes('<li>')) {
      html = `<ul>${html}</ul>`;
    }

    // Convert newlines to breaks for general text flow
    html = html.split('\n').map((line, index) => {
      // Avoid adding <br> tags within existing block-level elements
      if (line.trim().startsWith('<h') || line.trim().startsWith('<ul') || line.trim().startsWith('<li>')) {
        return line;
      }
      return line + (index < html.split('\n').length - 1 ? '<br/>' : '');
    }).join('');

    return html;
  };

  const formattedHtml = renderMarkdown(report.text);

  const handleDownloadPdf = () => {
    if (!report) return;

    const sourceLinksHtml = report.groundingLinks.length > 0
      ? `
      <div class="source-list">
        <h3>Sources & References</h3>
        <ul>
          ${report.groundingLinks.filter(link => link.web?.uri).map((link, index) => `
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-external-link">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              <a href="${link.web?.uri}" target="_blank">${link.web?.title || link.web?.uri}</a>
            </li>
          `).join('')}
        </ul>
      </div>
      `
      : '';

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Prospect Report</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    margin: 20mm;
                    color: #333;
                    line-height: 1.6;
                }
                h1, h2, h3 {
                    color: #1e3a8a;
                    page-break-after: avoid;
                    margin-top: 1.5em;
                    margin-bottom: 0.8em;
                }
                h1 { font-size: 2.2em; border-bottom: 2px solid #e0e7ff; padding-bottom: 0.5em; }
                h2 { font-size: 1.8em; }
                h3 { font-size: 1.4em; }
                ul {
                    list-style-type: disc;
                    margin-left: 25px;
                    padding-left: 0;
                    margin-bottom: 1em;
                }
                li {
                    margin-bottom: 0.6em;
                }
                strong {
                    font-weight: 700;
                    color: #2563eb;
                }
                .report-container {
                    margin-bottom: 30px;
                }
                .source-list {
                    margin-top: 40px;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 20px;
                }
                .source-list h3 {
                    color: #4a5568;
                    font-size: 1.2em;
                    margin-bottom: 1em;
                }
                .source-list ul {
                    list-style-type: none;
                    margin-left: 0;
                    padding-left: 0;
                }
                .source-list li {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 10px;
                    font-size: 0.9em;
                }
                .source-list a {
                    color: #2563eb;
                    text-decoration: underline;
                    word-break: break-all;
                }
                .source-list svg {
                  width: 1em;
                  height: 1em;
                  margin-right: 8px;
                  color: #2563eb;
                  flex-shrink: 0;
                  margin-top: 0.2em; /* Align icon with text */
                }
                @page {
                    margin: 20mm;
                }
            </style>
        </head>
        <body>
            <div class="report-container">
                ${formattedHtml}
            </div>
            ${sourceLinksHtml}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      // setTimeout(() => printWindow.close(), 100); // Close after a short delay
    }
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h2 className="text-3xl font-bold text-gray-900">Prospect Report</h2>
        <button
          onClick={handleDownloadPdf}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
          aria-label="Download report as PDF"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H5a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v3m2 3v6a2 2 0 01-2 2h-5"
            ></path>
          </svg>
          Download as PDF
        </button>
      </div>
      <div
        className="prose prose-blue max-w-none leading-relaxed text-gray-700"
        dangerouslySetInnerHTML={{ __html: formattedHtml }}
      />
      <LinkList links={report.groundingLinks} />
    </div>
  );
};

export default ProspectResult;