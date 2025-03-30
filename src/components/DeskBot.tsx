import React, { useState } from 'react';
import { Send, ChefHat, DollarSign, Utensils, Clock } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'recipe' | 'cost';
  recipe?: {
    name: string;
    ingredients: { name: string; quantity: string; cost: number }[];
    totalCost: number;
    preparationTime: string;
    profitMargin: number;
  };
}

const MOCK_INVENTORY = {
  'tomatoes': { quantity: 15, cost: 0.50, expiry: '2024-03-20' },
  'lettuce': { quantity: 8, cost: 1.00, expiry: '2024-03-18' },
  'chicken': { quantity: 10, cost: 3.50, expiry: '2024-03-21' },
  'pasta': { quantity: 20, cost: 1.20, expiry: '2024-03-25' },
  'cheese': { quantity: 12, cost: 2.50, expiry: '2024-03-22' }
};

export function DeskBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your Smart Kitchen Assistant. I can help you with recipe suggestions, cost analysis, and inventory management. Try asking me to:\n\n• Suggest a recipe using current inventory\n• Calculate costs for a dish\n• Create a special using soon-to-expire items",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const generateRecipe = () => {
    // Find soon-to-expire ingredients
    const soonToExpire = Object.entries(MOCK_INVENTORY)
      .filter(([_, details]) => {
        const daysUntilExpiry = Math.floor(
          (new Date(details.expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry <= 3;
      })
      .map(([name]) => name);

    // Generate a recipe using available ingredients
    const recipe = {
      name: "Fresh Mediterranean Pasta Salad",
      ingredients: [
        { name: "pasta", quantity: "200g", cost: MOCK_INVENTORY.pasta.cost },
        { name: "tomatoes", quantity: "3 pieces", cost: MOCK_INVENTORY.tomatoes.cost },
        { name: "lettuce", quantity: "1 head", cost: MOCK_INVENTORY.lettuce.cost },
        { name: "cheese", quantity: "100g", cost: MOCK_INVENTORY.cheese.cost }
      ],
      totalCost: 0,
      preparationTime: "25 minutes",
      profitMargin: 65
    };

    // Calculate total cost
    recipe.totalCost = recipe.ingredients.reduce((sum, ing) => sum + ing.cost, 0);

    return recipe;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInput('');

    // Generate bot response based on input
    setTimeout(() => {
      let botResponse: Message;

      if (input.toLowerCase().includes('recipe') || input.toLowerCase().includes('suggest')) {
        const recipe = generateRecipe();
        botResponse = {
          id: messages.length + 2,
          text: `I suggest making ${recipe.name} using our current inventory:`,
          sender: 'bot',
          timestamp: new Date(),
          type: 'recipe',
          recipe
        };
      } else if (input.toLowerCase().includes('cost') || input.toLowerCase().includes('price')) {
        const recipe = generateRecipe();
        botResponse = {
          id: messages.length + 2,
          text: "Here's the cost analysis for our suggested special:",
          sender: 'bot',
          timestamp: new Date(),
          type: 'cost',
          recipe
        };
      } else {
        botResponse = {
          id: messages.length + 2,
          text: "I can help you with recipe suggestions and cost analysis. Would you like me to suggest a recipe using our current inventory?",
          sender: 'bot',
          timestamp: new Date(),
        };
      }

      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white shadow-sm p-4 flex items-center">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">Kitchen Assistant</h2>
          <p className="text-sm text-gray-600">AI-powered recipe suggestions and cost optimization</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-4 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-line">{message.text}</p>
              
              {message.type === 'recipe' && message.recipe && (
                <div className="mt-4 bg-white rounded-lg p-4 text-gray-900">
                  <div className="flex items-center gap-2 mb-3">
                    <ChefHat className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">{message.recipe.name}</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Prep time: {message.recipe.preparationTime}</span>
                    </div>
                    <div className="mt-2">
                      <p className="font-medium mb-2">Ingredients:</p>
                      <ul className="space-y-1 text-sm">
                        {message.recipe.ingredients.map((ing, idx) => (
                          <li key={idx} className="flex justify-between">
                            <span>{ing.name} ({ing.quantity})</span>
                            <span className="text-gray-600">{formatCurrency(ing.cost)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {message.type === 'cost' && message.recipe && (
                <div className="mt-4 bg-white rounded-lg p-4 text-gray-900">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold">Cost Analysis</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Total Cost:</span>
                      <span className="font-medium">{formatCurrency(message.recipe.totalCost)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Suggested Price:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(message.recipe.totalCost * (1 + message.recipe.profitMargin / 100))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Profit Margin:</span>
                      <span className="font-medium text-blue-600">{message.recipe.profitMargin}%</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>💡 Tip: This price point aligns with market rates while maintaining healthy margins.</p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs opacity-75 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border-t p-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for recipe suggestions or cost analysis..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}