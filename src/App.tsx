import React, { useState } from 'react';
import { Home, MessageSquare, Camera, BarChart, Settings, ChefHat, Utensils } from 'lucide-react';
import { DeskBot } from './components/DeskBot';
import { HomePage } from './components/HomePage';
import { VisualInventory } from './components/VisualInventory';
import { SalesForecasting } from './components/SalesForecasting';
import RecipePage from './components/RecipePage';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'bot' | 'inventory' | 'forecast' | 'recipe'>('home');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-20 bg-white shadow-lg flex flex-col items-center py-8 space-y-8">
        <div className="p-3 rounded-xl bg-blue-100">
          <ChefHat className="w-6 h-6 text-blue-600" />
        </div>
        <nav className="flex flex-col space-y-4">
          {/* Home Button */}
          <button
            onClick={() => setCurrentPage('home')}
            className={`p-3 rounded-xl transition-colors ${currentPage === 'home' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            <Home className="w-6 h-6" />
          </button>

          {/* Recipe Generator Button */}
          <button
            onClick={() => setCurrentPage('recipe')}
            className={`p-3 rounded-xl transition-colors ${currentPage === 'recipe' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            <Utensils className="w-6 h-6" />
          </button>

          {/* Visual Inventory Button */}
          <button
            onClick={() => setCurrentPage('inventory')}
            className={`p-3 rounded-xl transition-colors ${currentPage === 'inventory' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            <Camera className="w-6 h-6" />
          </button>

          {/* Sales Forecasting Button */}
          <button
            onClick={() => setCurrentPage('forecast')}
            className={`p-3 rounded-xl transition-colors ${currentPage === 'forecast' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            <BarChart className="w-6 h-6" />
          </button>

          {/* Desk Bot Button */}
          <button
            onClick={() => setCurrentPage('bot')}
            className={`p-3 rounded-xl transition-colors ${currentPage === 'bot' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            <MessageSquare className="w-6 h-6" />
          </button>

          {/* Settings Button */}
          <button className="p-3 rounded-xl text-gray-400 hover:bg-gray-100">
            <Settings className="w-6 h-6" />
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'recipe' && <RecipePage />}
        {currentPage === 'bot' && <DeskBot />}
        {currentPage === 'inventory' && <VisualInventory />}
        {currentPage === 'forecast' && <SalesForecasting />}
      </div>
    </div>
  );
}

export default App;
