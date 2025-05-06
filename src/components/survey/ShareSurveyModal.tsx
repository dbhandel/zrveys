import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { FaCopy, FaCheck } from 'react-icons/fa';

interface ShareSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyId: string;
}

export const ShareSurveyModal: React.FC<ShareSurveyModalProps> = ({
  isOpen,
  onClose,
  surveyId
}) => {
  const [copied, setCopied] = useState(false);
  const surveyUrl = `${window.location.origin}/survey/${surveyId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Share Survey</h2>
        <p className="text-gray-600 mb-4">
          Share this URL with people you want to take your survey:
        </p>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={surveyUrl}
            readOnly
            className="flex-1 px-3 py-2 border rounded-md bg-gray-50"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors flex items-center space-x-2"
          >
            {copied ? (
              <>
                <FaCheck />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <FaCopy />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-6 text-gray-600">
          <h3 className="font-semibold mb-2">Note:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Each person can only submit the survey once</li>
            <li>Progress is automatically saved</li>
            <li>Questions must be answered in order</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
