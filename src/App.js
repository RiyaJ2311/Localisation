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
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'url'
  const [url, setUrl] = useState('');
  const [fetchingUrl, setFetchingUrl] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setUrl('');
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

  const handleUrlFetch = async () => {
    if (!url) return;
    setFetchingUrl(true);
    setFileName('');
    setError('');
    setJsonData(null);
    setTranslated({});
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      const text = await res.text();
      try {
        const parsed = JSON.parse(text);
        setJsonData(parsed);
        setError('');
      } catch (err) {
        setError('Invalid JSON at URL: ' + (err.message || err.toString()));
      }
    } catch (err) {
      let msg = 'Could not fetch URL: ' + (err.message || err.toString());
      if (err.message && err.message.includes('Failed to fetch')) {
        msg += ' (Possible reasons: CORS error, invalid URL, or the server does not allow cross-origin requests.)';
      }
      setError(msg);
    } finally {
      setFetchingUrl(false);
    }
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

  // Only show error for URL input if there is a URL and an error
  const showUrlError = inputMode === 'url' && url && error;
  // Only show error for file input if there is a file and an error
  const showFileError = inputMode === 'file' && fileName && error;

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
            <li>Click <b>Upload File</b> or <b>Enter URL</b> to provide your JSON.</li>
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
      <div className="input-mode-toggle">
        <button
          className={inputMode === 'file' ? 'input-mode-btn active' : 'input-mode-btn'}
          onClick={() => { setInputMode('file'); setError(''); }}
        >
          <span role="img" aria-label="Upload">📁</span> Upload File
        </button>
        <button
          className={inputMode === 'url' ? 'input-mode-btn active' : 'input-mode-btn'}
          onClick={() => { setInputMode('url'); setError(''); }}
        >
          <span role="img" aria-label="Link">🔗</span> Enter URL
        </button>
      </div>
      <div className="input-section-card">
        {inputMode === 'file' ? (
          <div className="file-input-section">
            <label htmlFor="json-upload" className="file-label">
              Click to upload or drag and drop
            </label>
            <input
              id="json-upload"
              type="file"
              accept="application/json,.json"
              onChange={handleFileChange}
            />
            {fileName && <span className="file-name">{fileName}</span>}
            {showFileError && <div className="inline-error">{error}</div>}
          </div>
        ) : (
          <div className="url-input-section">
            <input
              type="text"
              className="url-input"
              placeholder="Paste JSON file URL here..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              disabled={fetchingUrl}
            />
            <button
              className="fetch-url-btn"
              onClick={handleUrlFetch}
              disabled={fetchingUrl || !url}
            >
              {fetchingUrl ? 'Fetching...' : 'Fetch JSON'}
            </button>
            {showUrlError && <div className="inline-error">{error}</div>}
          </div>
        )}
      </div>
      {!jsonData && !error && (
        <div className="empty-illustration">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="40" width="80" height="50" rx="8" fill="#eaf6ff" stroke="#b3e0ff" strokeWidth="2"/>
            <rect x="35" y="55" width="50" height="8" rx="2" fill="#b3e0ff"/>
            <rect x="35" y="68" width="30" height="6" rx="2" fill="#b3e0ff"/>
            <circle cx="60" cy="95" r="6" fill="#b3e0ff"/>
          </svg>
          <div className="empty-text">No JSON loaded yet.<br/>Upload a file or enter a URL to get started!</div>
        </div>
      )}
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