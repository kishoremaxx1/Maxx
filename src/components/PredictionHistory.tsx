import React, { useState } from 'react';
import { PredictionItem } from '../types';
import { History, ArrowUp, ArrowDown, Clock, X } from 'lucide-react';

interface PredictionHistoryProps {
  history: PredictionItem[];
  loading: boolean;
}

const PredictionHistory: React.FC<PredictionHistoryProps> = ({ history, loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <>
      <button
        onClick={toggleModal}
        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        <History className="h-5 w-5" />
        <span>View Prediction History</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden animate-fade-in">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center">
                <History className="h-5 w-5 mr-2" />
                Prediction History
              </h2>
              <button
                onClick={toggleModal}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(80vh-8rem)]">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No prediction history available
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-lg p-4 transition-all duration-300 transform hover:scale-[1.02] ${
                        item.isActual
                          ? item.result === (item.periodNumber >= 5 ? 'Big' : 'Small')
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                          : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <Clock className="h-4 w-4 mr-2" />
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-semibold">
                              Period: {item.issueNumber}
                            </span>
                            <div className={`flex items-center space-x-2 ${
                              item.result === 'Big'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}>
                              <span className="font-bold">{item.result}</span>
                              {item.result === 'Big' ? (
                                <ArrowUp className="h-5 w-5 animate-bounce" />
                              ) : (
                                <ArrowDown className="h-5 w-5 animate-bounce" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.isActual
                            ? item.result === (item.periodNumber >= 5 ? 'Big' : 'Small')
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                        }`}>
                          {item.isActual ? (
                            item.result === (item.periodNumber >= 5 ? 'Big' : 'Small')
                              ? 'Correct'
                              : 'Incorrect'
                          ) : 'Pending'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PredictionHistory;