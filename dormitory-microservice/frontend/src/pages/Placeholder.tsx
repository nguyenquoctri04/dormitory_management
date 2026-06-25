import React from 'react';

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md min-h-[400px] flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      <p className="text-gray-600 italic">Chức năng này đang được phát triển...</p>
      <div className="mt-8 w-16 h-16 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
    </div>
  );
}
