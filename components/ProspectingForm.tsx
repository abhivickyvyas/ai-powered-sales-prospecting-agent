import React, { useState, useCallback } from 'react';
import { ProspectingFormInputs } from '../types';

interface ProspectingFormProps {
  onSubmit: (inputs: ProspectingFormInputs) => void;
  isLoading: boolean;
}

const ProspectingForm: React.FC<ProspectingFormProps> = ({ onSubmit, isLoading }) => {
  const [companyOrIndustry, setCompanyOrIndustry] = useState<string>('');
  const [focusArea, setFocusArea] = useState<string>('Omnichannel Investment');
  const [additionalKeywords, setAdditionalKeywords] = useState<string>('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ companyOrIndustry, focusArea, additionalKeywords });
  }, [companyOrIndustry, focusArea, additionalKeywords, onSubmit]);

  const focusAreaOptions = [
    'Omnichannel Investment',
    'Supply Chain Challenges',
    'Executive Changes',
    'Cloud Migration',
    'Financial Performance (AI/Digital Transformation)',
    'Industry Event Participation',
    'Website Capability Gaps',
    'General OMS/IMS Needs',
    'OMS related job posts', // Added new option here
  ];

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto space-y-6">
      <div>
        <label htmlFor="companyOrIndustry" className="block text-sm font-medium text-gray-700 mb-1">
          Company Name or Industry Focus (e.g., "Target" or "Retailers in North America")
        </label>
        <input
          type="text"
          id="companyOrIndustry"
          value={companyOrIndustry}
          onChange={(e) => setCompanyOrIndustry(e.target.value)}
          required
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="e.g., Walmart, Fashion Retail, B2B Logistics"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="focusArea" className="block text-sm font-medium text-gray-700 mb-1">
          Key Buying Signal / Focus Area
        </label>
        <select
          id="focusArea"
          value={focusArea}
          onChange={(e) => setFocusArea(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          disabled={isLoading}
        >
          {focusAreaOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="additionalKeywords" className="block text-sm font-medium text-gray-700 mb-1">
          Additional Keywords or Context (Optional)
        </label>
        <textarea
          id="additionalKeywords"
          value={additionalKeywords}
          onChange={(e) => setAdditionalKeywords(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="e.g., 'struggling with legacy systems', 'expanding internationally', 'high return rates'"
          disabled={isLoading}
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full inline-flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
        disabled={isLoading || !companyOrIndustry.trim()}
      >
        {isLoading ? (
          <span className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
            Prospecting...
          </span>
        ) : (
          'Generate Prospect Report'
        )}
      </button>
    </form>
  );
};

export default ProspectingForm;