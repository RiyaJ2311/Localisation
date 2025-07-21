import React, { useState } from 'react';
import './App.css';

const LANGUAGES = [
  { code: 'de', label: 'German (de)' },
  { code: 'es', label: 'Spanish (es)' },
  { code: 'hi', label: 'Hindi (hi)' },
];

const SAMPLE_JSON = `{
  "greeting": "Hello",
  "farewell": "Goodbye",
  "thanks": "Thank you"
}`;

function App() {
  const [jsonData, setJsonData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [translated, setTranslated] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(true);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        setJsonData(parsed);
        setError('');
        setTranslated({});
      } catch (err) {
        setError('Invalid JSON file: ' + (err.message || err.toString()));
        setJsonData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleLangChange = (code) => {
    setSelectedLangs((prev) =>
      prev.includes(code)
        ? prev.filter((l) => l !== code)
        : [...prev, code]
    );
  };

  const handleTranslate = async () => {
    if (!jsonData || selectedLangs.length === 0) return;
    setLoading(true);
    setError('');
    setTranslated({});
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: selectedLangs, data: jsonData }),
      });
      if (!res.ok) throw new Error('Translation failed.');
      const result = await res.json();
      setTranslated(result);
    } catch (err) {
      setError(err.message || 'Translation failed.');
    } finally {
      setLoading(false);
    }
  };

  const downloadJson = (lang) => {
    const dataStr = JSON.stringify(translated[lang], null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lang}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      {showInfo && (
        <div className="info-box">
          <button className="close-info" onClick={() => setShowInfo(false)} title="Dismiss">×</button>
          <h2>How to use Language Localisation</h2>
          <ol>
            <li>Prepare your <b>JSON</b> file (any valid JSON structure). Example:
              <pre className="sample-json">{SAMPLE_JSON}</pre>
            </li>
            <li>Click <b>Import JSON</b> and select your file.</li>
            <li>Select target languages and click <b>Translate</b>.</li>
            <li>Download the translated files.</li>
          </ol>
          <div className="backend-info">
            <b>Backend required:</b> The app sends a POST request to <code>/api/translate</code>.<br/>
            You must run a backend server that handles this endpoint and returns translated JSONs.<br/>
            <a href="https://github.com/RiyaJ2311/Localisation#4-api-requirement" target="_blank" rel="noopener noreferrer">See README for API details</a>.
          </div>
        </div>
      )}
      <h1>Language Localisation</h1>
      <div className="file-input-section">
        <label htmlFor="json-upload" className="file-label">
          Import JSON:
        </label>
        <input
          id="json-upload"
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
        />
        {fileName && <span className="file-name">{fileName}</span>}
      </div>
      {error && <div className="error">{error}</div>}
      {jsonData && (
        <div className="table-section">
          <table className="json-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(jsonData).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{typeof value === 'object' ? JSON.stringify(value) : value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {jsonData && (
        <div className="lang-section">
          <div className="checkboxes">
            {LANGUAGES.map((lang) => (
              <label key={lang.code} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedLangs.includes(lang.code)}
                  onChange={() => handleLangChange(lang.code)}
                />
                {lang.label}
              </label>
            ))}
          </div>
          <button
            className="translate-btn"
            onClick={handleTranslate}
            disabled={loading || selectedLangs.length === 0}
          >
            {loading ? 'Translating...' : 'Translate'}
          </button>
        </div>
      )}
      {Object.keys(translated).length > 0 && (
        <div className="downloads-section">
          <h2>Download Translated Files</h2>
          {Object.keys(translated).map((lang) => (
            <button
              key={lang}
              className="download-btn"
              onClick={() => downloadJson(lang)}
            >
              Download {lang}.json
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default App; 