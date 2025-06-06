import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import '../App.css'; // Assuming App.css is in src/ and contains relevant styles
import { getPresets, addPreset, deletePreset, setActiveDirectory } from '../services/api';
import type { UIPreset } from '../services/api';

// Helper to derive a name from a path
const pathToName = (path: string): string => {
  if (!path) return 'Unnamed Preset';
  // Remove trailing slash if any, then get the last component
  const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
  return normalizedPath.split('/').pop() || normalizedPath;
};

export const Route = createFileRoute('/dashboard')({
  component: DashboardComponent,
});

function DashboardComponent() {
  const [presets, setPresets] = useState<UIPreset[]>([]);
  const [newPresetPath, setNewPresetPath] = useState('');
  const [activeDirectoryPath, setActiveDirectoryPath] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        setLoading(true);
        setError(null);
        const presetPaths = await getPresets(); // API returns string[]
        const uiPresets = presetPaths.map(path => ({ path, name: pathToName(path) }));
        setPresets(uiPresets);
      } catch (err) {
        console.error('Failed to load presets:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching presets.');
      } finally {
        setLoading(false);
      }
    };
    fetchPresets();
  }, []);

  const handleAddPreset = async () => {
    if (!newPresetPath.trim()) {
      setError('Preset path cannot be empty.');
      return;
    }
    try {
      setError(null);
      const result = await addPreset(newPresetPath);
      let presetsToSet: string[] = [];

      if (Array.isArray(result)) { // Case: API directly returns the array of preset strings
        presetsToSet = result;
        console.log('handleAddPreset: API returned an array directly.');
      } else if (result && Array.isArray(result.presets)) { // Case: API returns an object { message, presets }
        presetsToSet = result.presets;
        if (result.message) {
          console.log('Server message:', result.message); // Optional: handle success message
        }
      } else {
        console.warn('handleAddPreset: API response did not contain a valid presets array.', result);
        setError('Preset action completed, but failed to update list from response. Please refresh or check console.');
        setNewPresetPath('');
        return; // Exit if no valid presets found to map
      }

      const uiPresets = presetsToSet.map(path => ({ path, name: pathToName(path) }));
      setPresets(uiPresets);
      setNewPresetPath('');
    } catch (err) {
      console.error('Failed to add preset:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while adding preset.');
    }
  };

  const handleDeletePreset = async (pathToDelete: string) => {
    try {
      setError(null);
      const result = await deletePreset(pathToDelete); // API returns { message, presets: string[] }
      const uiPresets = result.presets.map(path => ({ path, name: pathToName(path) }));
      setPresets(uiPresets);
      // Optionally show result.message as a success notification
    } catch (err) {
      console.error('Failed to delete preset:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while deleting preset.');
    }
  };

  const handleSetActiveDirectory = async (path: string) => {
    if (!path.trim()) {
      setError('Active directory path cannot be empty.');
      return;
    }
    try {
      setError(null);
      setActiveDirectoryPath(path); // Optimistically update input field
      const result = await setActiveDirectory(path); // API returns { message, videoCount }
      console.log('Set active directory result:', result.message, 'Videos found:', result.videoCount);
      // Optionally show result.message as a success notification
    } catch (err) {
      console.error('Failed to set active directory:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while setting active directory.');
      // Potentially revert activeDirectoryPath if API call fails and it was important for UI consistency
    }
  };

  if (loading) {
    return <div className="container"><p>Loading presets...</p></div>;
  }

  return (
    <div className="container">
      <h1>MV Player Remote Control - Dashboard</h1>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <section className="presets-section">
        <h2>Preset Folders</h2>
        <ul className="presets-list">
          {presets.map((preset) => (
            <li key={preset.path} className="preset-item">
              <span>{preset.name} ({preset.path})</span> {/* Show name and path */}
              <div>
                <button onClick={() => handleSetActiveDirectory(preset.path)}>Play</button>
                <button onClick={() => handleDeletePreset(preset.path)} className="delete-button">Delete</button>
              </div>
            </li>
          ))}
          {presets.length === 0 && !loading && <p>No presets saved yet.</p>}
        </ul>
        <div className="add-preset-form">
          <input
            type="text"
            value={newPresetPath}
            onChange={(e) => setNewPresetPath(e.target.value)}
            placeholder="Enter absolute path for new preset"
          />
          <button onClick={handleAddPreset}>Add Preset</button>
        </div>
      </section>

      <section className="active-directory-section">
        <h2>Set Active Directory</h2>
        <div className="set-active-form">
          <input
            type="text"
            value={activeDirectoryPath}
            onChange={(e) => setActiveDirectoryPath(e.target.value)}
            placeholder="Enter absolute path or select a preset"
          />
          <button onClick={() => handleSetActiveDirectory(activeDirectoryPath)}>Set & Play</button>
        </div>
      </section>
    </div>
  );
}
