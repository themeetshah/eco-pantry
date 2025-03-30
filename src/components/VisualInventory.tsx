import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';

interface Detection {
  class: string;
  score: number;
  bbox: [number, number, number, number];
}

interface InventoryItem {
  name: string;
  quantity: number;
  lastUpdated: Date;
}

// List of fruits and vegetables we want to detect
const VALID_ITEMS = new Set([
  'apple', 'orange', 'banana', 'carrot', 'broccoli',
  'tomato', 'cucumber', 'potato', 'onion', 'lemon'
]);

export function VisualInventory() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [inventory, setInventory] = useState<Record<string, InventoryItem>>({});

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };
    loadModel();
  }, []);

  // Update inventory based on detections
  useEffect(() => {
    const newInventory = { ...inventory };

    // Count detected items
    const detectedCounts: Record<string, number> = {};
    detections.forEach(detection => {
      if (VALID_ITEMS.has(detection.class.toLowerCase())) {
        detectedCounts[detection.class] = (detectedCounts[detection.class] || 0) + 1;
      }
    });

    // Update inventory state
    Object.entries(detectedCounts).forEach(([item, count]) => {
      newInventory[item] = {
        name: item,
        quantity: count,
        lastUpdated: new Date()
      };
    });

    setInventory(newInventory);

    // Call the API to update/add the items to the database
    Object.entries(detectedCounts).forEach(([item, count]) => {
      updateInventoryItem(item, count); // Call API to add/update the item
    });
  }, [detections]);

  const detect = async () => {
    if (!model || !webcamRef.current || !canvasRef.current || !isCameraOn) return;

    const video = webcamRef.current.video;
    if (!video) return;

    // Get video properties
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // Set canvas dimensions
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    // Make detection
    const predictions = await model.detect(video);

    // Filter for fruits and vegetables only
    const filteredPredictions = predictions.filter(prediction =>
      VALID_ITEMS.has(prediction.class.toLowerCase())
    );

    setDetections(filteredPredictions);

    // Draw results
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    filteredPredictions.forEach(prediction => {
      const [x, y, width, height] = prediction.bbox;

      // Draw bounding box
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Draw label background
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(x, y - 20, prediction.class.length * 8 + 60, 20);

      // Draw label text
      ctx.fillStyle = '#000000';
      ctx.font = '16px Arial';
      ctx.fillText(
        `${prediction.class} ${Math.round(prediction.score * 100)}%`,
        x + 5,
        y - 5
      );
    });

    // Request next frame
    requestAnimationFrame(detect);
  };

  useEffect(() => {
    if (!isLoading && isCameraOn) {
      detect();
    }
  }, [isLoading, isCameraOn, model]);

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  // Function to call the API to add/update inventory
  const updateInventoryItem = async (itemName: string, quantity: number) => {
    const cost = '100'; // Set cost, or get dynamically
    const today = new Date();
    today.setDate(today.getDate() + 10); // Add 10 days to today's date

    // Format the expiry date in the "YYYY-MM-DD" format
    const expiry = today.toISOString().split('T')[0]; // Converts to "YYYY-MM-DD"
    const status = quantity > 5 ? 'In Stock' : quantity > 2 ? 'Low' : 'Critical'; // Example status

    try {
      const response = await fetch(`http://localhost:5000/api/inventory/add/${itemName}`, {
        method: 'PUT', // PUT request to add or update item
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cost,
          expiry,
          status,
          quantity,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Item updated or added:', data);
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Produce Inventory Tracking</h2>
          <p className="text-gray-600">Real-time fruit and vegetable detection</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={toggleCamera}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isCameraOn
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
          >
            {isCameraOn ? (
              <>
                <CameraOff className="w-5 h-5" /> Stop Camera
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" /> Start Camera
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative bg-black rounded-xl overflow-hidden">
          {isCameraOn && (
            <>
              <Webcam
                ref={webcamRef}
                className="w-full"
                mirrored={false}
                screenshotFormat="image/jpeg"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
              />
            </>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Loading AI model...
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Current Inventory</h3>
          <div className="space-y-4">
            {Object.entries(inventory).map(([key, item]) => (
              <div
                key={key}
                className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900 capitalize">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity} units
                  </p>
                  <p className="text-xs text-gray-500">
                    Last updated: {item.lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full ${item.quantity > 5
                  ? 'bg-green-100 text-green-800'
                  : item.quantity > 2
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                  {item.quantity > 5 ? 'In Stock' : item.quantity > 2 ? 'Low' : 'Critical'}
                </div>
              </div>
            ))}
            {Object.keys(inventory).length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No fruits or vegetables detected yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
