import React, { useEffect, useState } from 'react';
import { Utensils, Clock, TrendingUp, Trash2 } from 'lucide-react';

// Inventory Edit - Component
function EditInventoryModal({ item, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    cost: item?.cost || '',
    expiry: item?.expiry || '',
    status: item?.status || 'Good', // Defaulting to 'Good'
    quantity: item?.quantity || 0, // Adding quantity to the form
  });

  useEffect(() => {
    if (item) {
      setFormData({
        cost: item.cost,
        expiry: item.expiry,
        status: item.status,
        quantity: item.quantity, // Initialize quantity from the item
      });
    }
  }, [item]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(item.id, formData); // Save the edited item data
    onClose(); // Close the modal after saving
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">Edit Inventory Item</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cost</label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleInputChange}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Expiry</label>
            <input
              type="date"
              name="expiry"
              value={formData.expiry}
              onChange={handleInputChange}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            >
              <option value="Good">Good</option>
              <option value="Warning">Warning</option>
              <option value="Danger">Danger</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded text-sm font-medium text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  const [data, setData] = useState({ inventory: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null); // Store the item being edited

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        // Fetch inventory items
        const inventoryResponse = await fetch('http://localhost:5000/api/inventory');
        if (!inventoryResponse.ok) throw new Error('Failed to fetch inventory');
        const inventory = await inventoryResponse.json();
        setData({ inventory });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  const handleEditClick = (item) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditItem(null);
  };

  const handleSaveChanges = async (id, updatedData) => {
    try {
      // Send the updated data to the backend
      const response = await fetch(`http://localhost:5000/api/inventory/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update inventory');
      }

      // Fetch the updated inventory list to reflect changes
      const updatedInventory = await response.json();

      // Update the state with the new inventory data
      setData((prevData) => ({
        inventory: prevData.inventory.map((item) =>
          item.id === id ? { ...item, ...updatedData } : item),
      }));
    } catch (error) {
      console.error('Error updating item:', error);
      setError('Failed to update item');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Dashboard Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">EcoPantry Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your AI-powered kitchen management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Utensils className="w-6 h-6 text-blue-600" />}
          title="Active Orders"
          value="24"
          trend="+12%"
        />
        <StatCard
          icon={<Clock className="w-6 h-6 text-green-600" />}
          title="Avg. Prep Time"
          value="18 min"
          trend="-8%"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          title="Daily Revenue"
          value="₹3,240"
          trend="+15%"
        />
        <StatCard
          icon={<Trash2 className="w-6 h-6 text-red-600" />}
          title="Waste Reduction"
          value="32%"
          trend="+5%"
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventory Status</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left border-b-2 border-gray-200">Item</th>
                <th className="py-2 px-4 text-left border-b-2 border-gray-200">Quantity</th>
                <th className="py-2 px-4 text-left border-b-2 border-gray-200">Expiry</th>
                <th className="py-2 px-4 text-left border-b-2 border-gray-200">Cost</th>
                <th className="py-2 px-4 text-left border-b-2 border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4">{item.name}</td>
                  <td className="py-2 px-4">{item.quantity}</td>
                  <td className="py-2 px-4">{item.expiry}</td>
                  <td className="py-2 px-4">{'₹' + item.cost}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <EditInventoryModal
        item={editItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveChanges}
      />
    </div>
  );
}

// StatCard Component
const StatCard = ({ icon, title, value, trend }) => (
  <div className="bg-white p-4 rounded-xl shadow-md flex items-center space-x-4">
    <div className="bg-blue-50 p-2 rounded-full">{icon}</div>
    <div>
      <div className="text-xl font-semibold">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-500">{trend}</div>
    </div>
  </div>
);
