import React, { useState } from 'react';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';

interface ShareSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyId: string;
}

export const ShareSurveyModal: React.FC<ShareSurveyModalProps> = ({ isOpen, onClose, surveyId }) => {
  const [copied, setCopied] = useState(false);
  const surveyUrl = `${window.location.origin}/survey/${surveyId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Share this survey with your friends</h2>
        
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={surveyUrl}
            readOnly
            className="flex-1 p-2 border rounded-lg bg-gray-50"
          />
          <button
            onClick={copyToClipboard}
            className="p-2 text-gray-600 hover:text-[#8C3375] transition-colors"
            title="Copy to clipboard"
          >
            <ClipboardDocumentIcon className="h-6 w-6" />
          </button>
        </div>
        
        {copied && (
          <p className="text-green-600 text-sm mb-4">Copied to clipboard!</p>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 px-4 bg-[#8C3375] text-white rounded-lg hover:bg-[#732c60] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
