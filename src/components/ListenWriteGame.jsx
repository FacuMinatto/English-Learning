import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ArrowLeft, Volume2, Lightbulb, Trophy, RotateCcw, Check, SkipForward } from 'lucide-react';

export default function ListenWriteGame({ dictionary, onClose, onWin, playFx, speak }) {
  const [targetPhrase, setTargetPhrase] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState('playing'); // 'playing', 'won', 'skipped'
  const [hintLevel, setHintLevel] = useState(0); // 0: none, 1: spanish, 2: first letters
  const inputRef = useRef(null);

  // Filter phrases (3 to 15 words)
  const phrases = useMemo(() => {
    return dictionary.filter(item => {
      const wordsCount = item.english.trim().split(/\s+/).length;
      return wordsCount >= 3 && wordsCount <= 15;
    });
  }, [dictionary]);

  const initGame = useCallback(() => {
    if (phrases.length === 0) return;
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    setTargetPhrase(randomPhrase);
    setUserInput('');
    setStatus('playing');
    setHintLevel(0);
    // Auto-play sound on start
    setTimeout(() => {
      speak(randomPhrase.english);
    }, 400);
  }, [phrases, speak]);

  useEffect(() => {
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheck = () => {
    if (!targetPhrase) return;
    
    // Normalize both strings to compare: remove punctuation, extra spaces, lowercase
    const cleanStr = (str) => str.toLowerCase().replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ').trim();
    
    if (cleanStr(userInput) === cleanStr(targetPhrase.english)) {
      setStatus('won');
      playFx('success');
      onWin();
    } else {
      playFx('error');
      // Briefly show a red flash or shake (could be done via CSS class, but we keep it simple)
      const el = inputRef.current;
      if (el) {
        el.style.animation = 'shake 0.4s';
        setTimeout(() => el.style.animation = '', 400);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCheck();
    }
  };

  const showHint = () => {
    if (hintLevel < 2) {
      setHintLevel(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    setStatus('skipped');
    playFx('error');
  };

  // Generate the "First letters" hint string
  const getFirstLettersHint = () => {
    if (!targetPhrase) return '';
    return targetPhrase.english.split(' ').map(word => {
      // Keep punctuation if attached, or just show first letter
      return word.charAt(0) + '_'.repeat(word.length - 1);
    }).join(' ');
  };

  if (!targetPhrase) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando frases...</div>;
  }

  return (
    <div className="listen-write-container card-anim-entering" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', maxWidth: '600px', margin: '0 auto', background: 'var(--bg-card)', borderRadius: '16px', overflow: 'hidden' }}>
      
      {/* HEADER */}
      <div className="game-top-bar" style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex' }}>
        <button className="btn-game-back" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} /> Volver a Juegos
        </button>
      </div>

      <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        
        {status === 'playing' ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <button 
                onClick={() => speak(targetPhrase.english)}
                style={{ 
                  background: 'var(--primary-color)', color: '#fff', border: 'none', 
                  borderRadius: '50%', width: '80px', height: '80px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  cursor: 'pointer', boxShadow: '0 4px 12px rgba(40,194,140,0.3)',
                  margin: '0 auto'
                }}
              >
                <Volume2 size={40} />
              </button>
              <p style={{ color: 'var(--text-muted)', marginTop: '16px', fontSize: '1.1rem' }}>
                Toca para escuchar la frase
              </p>
            </div>

            <div style={{ width: '100%', maxWidth: '400px', marginBottom: '20px' }}>
              <textarea 
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe exactamente lo que escuchas..."
                style={{
                  width: '100%', minHeight: '100px', padding: '16px', fontSize: '1.2rem',
                  borderRadius: '12px', border: '2px solid var(--border-color)',
                  background: 'var(--bg-main)', color: 'var(--text-main)',
                  resize: 'none', textAlign: 'center', fontFamily: 'inherit'
                }}
                autoFocus
                spellCheck="false"
              />
            </div>

            {/* HINTS */}
            <div style={{ minHeight: '60px', width: '100%', maxWidth: '400px', textAlign: 'center', marginBottom: '20px' }}>
              {hintLevel === 0 && (
                <button className="btn-secondary" onClick={showHint} style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                  <Lightbulb size={16} /> Ver Pista (Traducción)
                </button>
              )}
              {hintLevel >= 1 && (
                <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem', color: 'var(--text-muted)' }}>
                  <strong>Significa:</strong> {targetPhrase.spanish}
                </div>
              )}
              {hintLevel === 1 && (
                <button className="btn-secondary" onClick={showHint} style={{ fontSize: '0.85rem', padding: '6px 12px', marginTop: '8px' }}>
                  <Lightbulb size={14} /> Mostrar Letras Iniciales
                </button>
              )}
              {hintLevel === 2 && (
                <div style={{ marginTop: '12px', fontSize: '1.2rem', letterSpacing: '2px', color: 'var(--primary-color)', fontFamily: 'monospace' }}>
                  {getFirstLettersHint()}
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px' }}>
              <button className="btn-secondary" onClick={handleSkip} style={{ flex: 1 }}>
                <SkipForward size={18} /> Rendirse
              </button>
              <button className="btn-primary" onClick={handleCheck} style={{ flex: 2 }}>
                <Check size={18} /> Comprobar
              </button>
            </div>
          </>
        ) : (
          // RESULT SCREEN (Won or Skipped)
          <div style={{ animation: 'fade-in 0.4s ease', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
            <div style={{ marginBottom: '16px', color: status === 'won' ? '#22c55e' : '#ef4444', display: 'flex', justifyContent: 'center' }}>
              {status === 'won' ? <Trophy size={60} /> : <SkipForward size={60} />}
            </div>
            <h2 style={{ fontSize: '1.6rem', margin: '0 0 20px 0', color: 'var(--text-main)' }}>
              {status === 'won' ? '¡Excelente oído!' : '¡Sigue practicando!'}
            </h2>

            <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <button 
                onClick={() => speak(targetPhrase.english)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '12px', color: 'var(--primary-color)' }}
              >
                <Volume2 size={30} />
              </button>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '12px' }}>
                {targetPhrase.english}
              </div>
              <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                {targetPhrase.spanish}
              </div>
            </div>

            <button className="btn-primary" onClick={initGame} style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
              <RotateCcw size={20} /> Siguiente Frase
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
