import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check } from 'lucide-react';

const OAuthDialog = ({ isOpen, onClose, authUrl, onCodeSubmit }) => {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(authUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    if (code.trim()) {
      onCodeSubmit(code.trim());
      setCode('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="oauth-overlay" onClick={onClose}>
      <div className="oauth-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="oauth-header">
          <div className="oauth-header-content">
            <div className="oauth-icon">☁️</div>
            <div>
              <h2>Connect to Dropbox</h2>
              <p className="oauth-subtitle">Authorize Docura to access your Dropbox</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="oauth-body">
          {/* Step 1 */}
          <div className="oauth-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Authorization URL</h3>
              <p className="step-description">
                Click the button below to open Dropbox authorization page in your browser
              </p>
              <div className="url-container">
                <input
                  type="text"
                  value={authUrl}
                  readOnly
                  className="url-input"
                />
                <button
                  className="copy-button"
                  onClick={handleCopyUrl}
                  title={copied ? 'Copied!' : 'Copy URL'}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <button className="open-browser-button" onClick={() => window.open(authUrl, '_blank')}>
                <ExternalLink size={18} />
                Open in Browser
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="oauth-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Authorize Docura</h3>
              <p className="step-description">
                On the Dropbox page, click <strong>"Allow"</strong> to grant Docura access to its app folder
              </p>
              <div className="info-box">
                <span className="info-icon">📁</span>
                <span className="info-text">Your files will be synced to <code>/Apps/Docura/</code> folder in your Dropbox for security and privacy</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="oauth-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Enter Authorization Code</h3>
              <p className="step-description">
                After authorization, you'll receive a code. Paste it below:
              </p>
              <div className="code-input-container">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Paste authorization code here..."
                  className="code-input"
                  autoFocus
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="oauth-footer">
          <button className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="button-primary" 
            onClick={handleSubmit}
            disabled={!code.trim()}
          >
            Connect Dropbox
          </button>
        </div>
      </div>
    </div>
  );
};

export default OAuthDialog;

