import React, { useState, useEffect } from 'react';
import { X, Github, Mail, Heart, Code, Zap } from 'lucide-react';
import { getVersion } from '@tauri-apps/api/app';

const AboutDialog = ({ isOpen, onClose }) => {
  const [appVersion, setAppVersion] = useState('Loading...');

  useEffect(() => {
    // Load version from Tauri (reads from tauri.conf.json at build time)
    const loadVersion = async () => {
      try {
        const version = await getVersion();
        setAppVersion(version);
      } catch (error) {
        console.error('Failed to load version:', error);
        setAppVersion('1.0.0'); // Fallback
      }
    };

    if (isOpen) {
      loadVersion();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const openLink = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="settings-overlay">
      <div className="settings-dialog" style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div className="settings-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>📝</div>
            <h2>About Docura</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ 
          display: 'block',
          padding: '32px', 
          maxHeight: '70vh', 
          overflowY: 'auto',
          width: '100%'
        }}>
          
          {/* Logo & Tagline */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
            <h3 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-primary)' }}>
              Docura
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
              From Markdown Editor to Writing Operating System
            </p>
            <p style={{ 
              color: 'var(--accent-color)', 
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              Version {appVersion} • Built in 37 Hours! ⚡
            </p>
          </div>

          {/* Author */}
          <div style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: '12px', 
            padding: '20px',
            marginBottom: '16px',
            border: '1px solid var(--border-color)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <h4 style={{ 
              fontSize: '16px', 
              marginBottom: '16px', 
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 0 16px 0'
            }}>
              <Code size={18} />
              Created By
            </h4>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--accent-color), var(--accent-hover))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: 'white',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                ET
              </div>
              <div>
                <p style={{ fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                  Ehsan Tork
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Solo Developer & Architect
                </p>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              width: '100%'
            }}>
              <button
                onClick={() => openLink('https://github.com/WOF-Softwares')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 12px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.borderColor = 'var(--accent-color)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-primary)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <Github size={16} />
                GitHub
              </button>

              <button
                onClick={() => openLink('mailto:ehsan.tork@hey.com')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 12px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.borderColor = 'var(--accent-color)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-primary)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <Mail size={16} />
                Email
              </button>
            </div>
          </div>

          {/* Special Thanks */}
          <div style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: '12px', 
            padding: '20px',
            marginBottom: '16px',
            border: '1px solid var(--border-color)'
          }}>
            <h4 style={{ 
              fontSize: '16px', 
              marginBottom: '16px', 
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Heart size={18} />
              Special Thanks
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ color: 'var(--accent-color)', fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={16} />
                  🤖 Claude AI (Anthropic)
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
                  Primary AI partner - architecture, problem-solving, and making Docura possible!
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <p style={{ color: 'var(--accent-color)', fontWeight: 'bold', marginBottom: '6px' }}>
                  💎 DHH (David Heinemeier Hansson)
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
                  For creating <strong>HEY</strong> (best email ever!), <strong>Ruby on Rails</strong> (web revolution), 
                  and <strong>Omakase</strong> (opinionated excellence). Your philosophy inspires us! 🙏
                </p>
              </div>
            </div>
          </div>

          {/* License */}
          <div style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: '12px', 
            padding: '20px',
            marginBottom: '16px',
            border: '1px solid var(--border-color)'
          }}>
            <h4 style={{ 
              fontSize: '16px', 
              marginBottom: '12px', 
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📜 License
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
              Apache License 2.0 - Free and Open Source Forever!
            </p>
            <div style={{ 
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: '1.8'
            }}>
              <div>✅ Commercial Use</div>
              <div>✅ Modify</div>
              <div>✅ Distribute</div>
              <div>✅ Private Use</div>
            </div>
          </div>

          {/* Support */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.1), rgba(var(--accent-rgb), 0.05))',
            borderRadius: '12px', 
            padding: '20px',
            border: '1px solid var(--accent-color)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>💝</div>
            <h4 style={{ 
              fontSize: '16px', 
              marginBottom: '8px', 
              color: 'var(--text-primary)'
            }}>
              Love Docura? Support Development!
            </h4>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              Help keep Docura free, open-source, and awesome!
            </p>
            <button
              onClick={() => openLink('https://wof-softwares.github.io/Docura/donate_me.html')}
              style={{
                padding: '12px 24px',
                background: 'var(--accent-color)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-hover)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--accent-color)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Heart size={18} />
              Donate & Support
            </button>
          </div>

          {/* Footer Links */}
          <div style={{ 
            marginTop: '24px', 
            paddingTop: '20px', 
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px'
          }}>
            <button
              onClick={() => openLink('https://github.com/WOF-Softwares/Docura')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-color)',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '4px'
              }}
            >
              📦 GitHub Repository
            </button>
            <button
              onClick={() => openLink('https://wof-softwares.github.io/Docura/')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-color)',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '4px'
              }}
            >
              🌐 Website
            </button>
            <button
              onClick={() => openLink('https://wof-softwares.github.io/Docura/wiki/')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-color)',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '4px'
              }}
            >
              📚 Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutDialog;

