import React from 'react';
import { GroundingChunk } from '../types';

interface LinkListProps {
  links: GroundingChunk[];
}

const LinkList: React.FC<LinkListProps> = ({ links }) => {
  if (!links || links.length === 0) {
    return null;
  }

  // Filter out invalid links
  const validLinks = links.filter(link => link.web?.uri);

  if (validLinks.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-inner border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-3">Sources & References</h3>
      <ul className="space-y-2">
        {validLinks.map((link, index) => (
          <li key={index} className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              ></path>
            </svg>
            <a
              href={link.web?.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm md:text-base break-words"
            >
              {link.web?.title || link.web?.uri}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LinkList;
