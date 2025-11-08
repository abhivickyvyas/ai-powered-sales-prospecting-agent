# AI-Powered Sales Prospecting Agent

## Overview

This application serves as an intelligent prospecting agent designed to identify high-potential sales leads for companies offering Order Management System (OMS) and Inventory Management System (IMS) solutions. By leveraging the power of Google's Gemini model with Google Search grounding, the app analyzes user queries about specific companies or industries, identifies key buying signals, and generates a comprehensive, actionable prospect report.

The generated report includes prioritized target companies, key decision-makers, customized email outreach drafts, and supporting insights backed by web sources.

## Features

-   **Intelligent Prospecting**: Enter a company name or industry to get a detailed analysis.
-   **Buying Signal Focus**: Narrow the search by focusing on specific buying signals like "Omnichannel Investment," "Supply Chain Challenges," or "Executive Changes."
-   **Dynamic Report Generation**: Leverages the Gemini Flash model to generate reports in real-time.
-   **Grounded in Reality**: Uses Google Search integration to ensure the insights are based on recent and relevant public information.
-   **Actionable Outputs**: Provides prioritized lists of companies, key decision-makers, and ready-to-use email templates.
-   **PDF Export**: Download the generated report as a clean, professionally formatted PDF document for offline use and sharing.
-   **Responsive UI**: A clean, modern, and responsive user interface built with React and Tailwind CSS.
-   **API Key Management**: Integrates with the AI Studio environment to securely handle API key selection.

## Tech Stack

-   **Frontend**: React, TypeScript
-   **AI Model**: Google Gemini Flash (`gemini-2.5-flash`)
-   **Styling**: Tailwind CSS
-   **API Client**: `@google/genai`

## Project Structure

The project follows a standard React component-based architecture:

```
.
├── src/
│   ├── components/         # Reusable React components
│   │   ├── LoadingSpinner.tsx
│   │   ├── LinkList.tsx
│   │   ├── ProspectingForm.tsx
│   │   ├── ProspectResult.tsx
│   ├── services/           # API interaction layer
│   │   └── geminiService.ts
│   ├── App.tsx             # Main application component
│   ├── index.tsx           # Entry point
│   ├── types.ts            # TypeScript type definitions
│   ├── constants.ts        # Application constants
├── index.html
├── metadata.json
├── README.md               # This file
└── readme/                 # Detailed documentation
    ├── architecture.md
    ├── flow.md
    └── sequence.md
```

## Core Logic

The application's core logic revolves around the `geminiService.ts` file, which constructs a detailed prompt for the Gemini model.

1.  **Prompt Engineering**: The service takes user inputs (company/industry, focus area, keywords) and embeds them into a comprehensive prompt template. This template instructs the AI to act as a sales prospecting agent and specifies the exact structure and content required in the output (using Markdown).
2.  **API Call with Grounding**: The `generateProspectData` function makes an API call to the Gemini model using `ai.models.generateContent`. Crucially, it enables the Google Search tool (`tools: [{ googleSearch: {} }]`). This allows the model to perform web searches to ground its response in up-to-date information.
3.  **Response Handling**: The service parses the model's response, extracting the main text content and the list of web sources (`groundingChunks`) returned by the grounding feature.
4.  **UI Rendering**:
    *   The `App.tsx` component manages the application's state (loading, error, report data).
    *   `ProspectingForm.tsx` captures user input.
    *   `ProspectResult.tsx` receives the generated report data, performs basic Markdown-to-HTML conversion for display, and renders the list of sources using the `LinkList.tsx` component.
5.  **PDF Generation**: The "Download as PDF" functionality in `ProspectResult.tsx` dynamically creates a new HTML document in a popup window with the report's content and custom print-friendly styles, then triggers the browser's print dialog to save it as a PDF. The filename is dynamically generated from the report's main heading.
