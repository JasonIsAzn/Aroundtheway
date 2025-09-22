"use client";
import { useState } from 'react';
import Header from '../components/Header';

export default function TestUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Adjust this URL to match your .NET API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Upload result:', result);

      // Assuming your API returns the image URL in a 'url' field
      if (result.url) {
        setUploadedImageUrl(result.url);
      } else {
        setError('Upload succeeded but no URL returned');
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-light uppercase tracking-wider mb-8">
            Image Upload Test
          </h1>

          <div className="space-y-6">
            {/* File Input */}
            <div>
              <label className="block text-sm uppercase tracking-wide mb-2">
                Select Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-medium file:bg-black file:text-white hover:file:bg-gray-800"
              />
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="p-4 bg-gray-50 border">
                <h3 className="text-sm uppercase tracking-wide mb-2">Selected File:</h3>
                <p className="text-sm">Name: {selectedFile.name}</p>
                <p className="text-sm">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <p className="text-sm">Type: {selectedFile.type}</p>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full py-3 px-6 bg-black text-white uppercase tracking-wider text-sm disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Success Display */}
            {uploadedImageUrl && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200">
                  <h3 className="text-sm uppercase tracking-wide mb-2 text-green-800">
                    Upload Successful!
                  </h3>
                  <p className="text-sm text-green-600 break-all">
                    URL: {uploadedImageUrl}
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(uploadedImageUrl)}
                    className="mt-2 px-3 py-1 bg-green-600 text-white text-xs uppercase tracking-wide hover:bg-green-700"
                  >
                    Copy URL
                  </button>
                </div>

                {/* Image Preview */}
                <div>
                  <h3 className="text-sm uppercase tracking-wide mb-2">Preview:</h3>
                  <img
                    src={uploadedImageUrl}
                    alt="Uploaded image"
                    className="max-w-full h-auto border border-gray-200"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              </div>
            )}

            {/* API Info */}
            <div className="p-4 bg-blue-50 border border-blue-200">
              <h3 className="text-sm uppercase tracking-wide mb-2 text-blue-800">
                API Info
              </h3>
              <p className="text-sm text-blue-600">
                This page attempts to upload to: <code>/api/upload</code>
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Make sure your .NET API is running and the endpoint is configured correctly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}