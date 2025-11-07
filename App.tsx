import React, { useState, useCallback } from 'react';
import ProspectingForm from './components/ProspectingForm';
import ProspectResult from './components/ProspectResult';
import LoadingSpinner from './components/LoadingSpinner';
import { generateProspectData } from './services/geminiService';
import { ProspectReport, ProspectingFormInputs } from './types';

function App() {
  const [prospectReport, setProspectReport] = useState<ProspectReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleProspectingSubmit = useCallback(async (inputs: ProspectingFormInputs) => {
    setIsLoading(true);
    setError(null);
    setProspectReport(null);
    try {
      // Check for API key before making the call.
      // This pattern is good practice for models that require user key selection.
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function' && typeof window.aistudio.openSelectKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
          // Assume success for race condition mitigation
        }
      }

      const report = await generateProspectData(inputs);
      setProspectReport(report);
    } catch (err: unknown) {
      console.error("Error during prospecting:", err);
      if (err instanceof Error && err.message.includes("API Key issue")) {
        setError("There's an issue with the API key. Please try re-selecting it or ensure it's valid.");
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
           // Optionally reopen the key selection dialog if it was an API key issue
           await window.aistudio.openSelectKey();
        }
      } else {
        setError(`Failed to generate report: ${err instanceof Error ? err.message : String(err)}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <header className="text-center mb-10 w-full max-w-4xl">
        <h1 className="text-5xl font-extrabold text-blue-800 mb-4 tracking-tight">
          AI Sales Prospecting Agent
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Intelligently identifies high-potential retailers and B2B companies needing
          Order Management System (OMS) and Inventory Management System (IMS) solutions.
          Monitors key buying signals to generate tailored insights and outreach content.
        </p>
      </header>

      <main className="w-full max-w-4xl space-y-8">
        <ProspectingForm onSubmit={handleProspectingSubmit} isLoading={isLoading} />

        {error && (
          <div className="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md max-w-2xl mx-auto text-center">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
            {error.includes("API Key issue") && (
              <p className="mt-2 text-sm">
                Ensure your API key is properly selected and has the necessary permissions. Refer to{' '}
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Gemini API billing documentation
                </a>.
              </p>
            )}
          </div>
        )}

        {isLoading && (
          <div className="mt-8">
            <LoadingSpinner message="Analyzing market signals and company data..." />
          </div>
        )}

        {!isLoading && prospectReport && (
          <ProspectResult report={prospectReport} />
        )}
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        Powered by Google Gemini
      </footer>
    </div>
  );
}

export default App;