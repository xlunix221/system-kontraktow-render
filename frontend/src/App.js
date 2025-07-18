import React from 'react';

export default function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center p-6 bg-gray-800/70 rounded-xl border border-violet-500/30 shadow-xl">
        <h1 className="text-3xl font-bold text-violet-300 mb-4">🔧 Prace techniczne</h1>
        <p className="text-gray-300 text-sm">
          System kontraktów jest tymczasowo niedostępny.<br />
          Trwają prace serwisowe lub aktualizacja aplikacji.<br />
          Spróbuj ponownie później 🙏
        </p>
      </div>
    </div>
  );
}
