import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

const AsciiArt = () => {
  const [image, setImage] = useState(null);
  const [asciiArt, setAsciiArt] = useState('');
  const [width, setWidth] = useState(100); // characters wide
  const [contrast, setContrast] = useState(1);
  const [charSet, setCharSet] = useState('standard'); // To choose character set
  const canvasRef = useRef(null);

  // ASCII character sets from dark to light
  const ASCII_CHARS = {
    standard: '@@%#*+=-:. ',
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          convertToAscii(img);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const convertToAscii = (img) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Calculate height while maintaining aspect ratio
    const aspectRatio = img.height / img.width;
    const height = Math.floor(width * aspectRatio * 0.5); // Multiply by 0.5 to account for character aspect ratio
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw and resize image
    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    
    let asciiImage = '';
    const chars = ASCII_CHARS[charSet]; // Get the chosen character set
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const offset = (y * width + x) * 4;
        const r = imageData.data[offset];
        const g = imageData.data[offset + 1];
        const b = imageData.data[offset + 2];
        
        // Convert to grayscale and adjust contrast
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) * contrast;
        const charIndex = Math.floor((brightness / 255) * (chars.length - 1));
        asciiImage += chars[charIndex];
      }
      asciiImage += '\n';
    }
    
    setAsciiArt(asciiImage);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">ASCII Art Generator</h1>
        
        {/* Upload Section */}
        <div className="mb-6">
          <label className="block p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <Upload className="mx-auto mb-2" size={32} />
            <p>Drop an image or click to upload</p>
          </label>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block mb-2">Width (characters)</label>
            <input
              type="range"
              min="20"
              max="200"
              value={width}
              onChange={(e) => {
                setWidth(Number(e.target.value));
                if (image) convertToAscii(image);
              }}
              className="w-full"
            />
            <span>{width} characters</span>
          </div>

          <div>
            <label className="block mb-2">Contrast</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={contrast}
              onChange={(e) => {
                setContrast(Number(e.target.value));
                if (image) convertToAscii(image);
              }}
              className="w-full"
            />
            <span>{contrast.toFixed(1)}x</span>
          </div>

          {/* Character Set Selection */}
          <div>
            <label className="block mb-2">Character Set</label>
            <select
              value={charSet}
              onChange={(e) => {
                setCharSet(e.target.value);
                if (image) convertToAscii(image);
              }}
              className="w-full p-2 border rounded"
            >
              <option value="standard">Standard</option>
              <option value="detailed">Detailed</option>
              <option value="blocks">Blocks</option>
            </select>
          </div>
        </div>

        {/* ASCII Output */}
        <div className="mt-6">
          <canvas ref={canvasRef} className="hidden" />
          {asciiArt && (
            <div className="relative">
              <pre className="text-xs leading-none font-mono bg-white p-4 border rounded-lg overflow-x-auto">
                {asciiArt}
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(asciiArt)}
                className="absolute top-2 right-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AsciiArt;
