import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, Trophy, XCircle, Volume2, RotateCcw } from 'lucide-react';
import { validWords } from '../utils/validWordleWords';

const ROWS = 6;
const COLS = 5;



export default function WordleGame({ dictionary, onClose, onWin, playFx, speak }) {
  const [targetWordObj, setTargetWordObj] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [status, setStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [toastMsg, setToastMsg] = useState('');
  const inputRef = React.useRef(null);

  // Auto-focus input for native keyboard
  useEffect(() => {
    if (status === 'playing') {
      inputRef.current?.focus();
    }
  }, [status]);

  // Filter 5-letter words without spaces or special characters
  const playableWords = useMemo(() => {
    return dictionary.filter(w => /^[a-zA-Z]{5}$/.test(w.english));
  }, [dictionary]);

  const initGame = useCallback(() => {
    if (playableWords.length === 0) return;
    const randomObj = playableWords[Math.floor(Math.random() * playableWords.length)];
    setTargetWordObj(randomObj);
    setGuesses([]);
    setCurrentGuess('');
    if (inputRef.current) inputRef.current.value = '';
    setStatus('playing');
    setToastMsg('');
  }, [playableWords]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleInputChange = (e) => {
    if (status !== 'playing') return;
    const val = e.target.value.replace(/[^a-zA-Z]/g, '');
    if (val.length <= COLS) {
      setCurrentGuess(val);
    }
  };

  const handleInputKeyDown = (e) => {
    if (status !== 'playing') return;
    if (e.key === 'Enter') {
      const sanitizedGuess = currentGuess.toUpperCase();
      if (sanitizedGuess.length !== COLS) {
        showToast('Faltan letras');
        return;
      }
      
      // Check if it's a valid English word or in the app's dictionary
      if (!validWords.has(sanitizedGuess) && !dictionary.some(w => w.english.toUpperCase() === sanitizedGuess)) {
        showToast('La palabra no existe');
        return;
      }

      const newGuesses = [...guesses, sanitizedGuess];
      setGuesses(newGuesses);
      
      setCurrentGuess('');

      if (sanitizedGuess === targetWordObj.english.toUpperCase()) {
        setStatus('won');
        playFx('success');
        onWin();
      } else if (newGuesses.length === ROWS) {
        setStatus('lost');
        playFx('error');
      }
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  };

  const getGuessColors = (guessStr) => {
    const targetArr = targetWordObj.english.toUpperCase().split('');
    const guessArr = guessStr.split('');
    const colors = Array(COLS).fill('gray');
    
    for (let i = 0; i < COLS; i++) {
      if (guessArr[i] === targetArr[i]) {
        colors[i] = 'green';
        targetArr[i] = null;
      }
    }
    
    for (let i = 0; i < COLS; i++) {
      if (colors[i] !== 'green' && targetArr.includes(guessArr[i])) {
        colors[i] = 'yellow';
        targetArr[targetArr.indexOf(guessArr[i])] = null;
      }
    }
    return colors;
  };



  if (!targetWordObj) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando diccionario...</div>;

  return (
    <div 
      className="wordle-container card-anim-entering" 
      style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', margin: '0 auto', background: 'var(--bg-color)', overflow: 'hidden' }}
    >
      


      {/* HEADER */}
      <div className="header" style={{ paddingBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn-game-back" onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-muted)' }}>
          <ArrowLeft size={20} /> Volver
        </button>
      </div>

      {toastMsg && (
        <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', background: 'var(--text-main)', color: 'var(--bg-color)', padding: '10px 20px', borderRadius: '999px', zIndex: 10, boxShadow: 'var(--shadow-lg)', fontWeight: '700', fontSize: '14px', animation: 'fadeIn 0.2s ease' }}>
          {toastMsg}
        </div>
      )}

      {/* GRID */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '10px 20px 20px', minHeight: 0 }} onClick={() => inputRef.current?.focus()}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px', margin: '0 auto', aspectRatio: '5/6' }}>
          
          {/* Fully transparent overlay input for perfect Gboard support */}
          {status === 'playing' && (
            <input 
              ref={inputRef}
              type="text"
              value={currentGuess}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              maxLength={COLS}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 1,
                color: 'transparent',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                caretColor: 'transparent',
                zIndex: 10
              }}
            />
          )}

          <div style={{ display: 'grid', gridTemplateRows: `repeat(${ROWS}, 1fr)`, gap: '8px', width: '100%', height: '100%' }}>
            {Array.from({ length: ROWS }).map((_, rowIndex) => {
            const isCurrentRow = rowIndex === guesses.length;
            const guessStr = guesses[rowIndex];
            const colors = guessStr ? getGuessColors(guessStr) : [];
            
            return (
              <div key={rowIndex} style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: '8px' }}>
                {Array.from({ length: COLS }).map((_, colIndex) => {
                  let letter = '';
                  let bg = 'var(--card-bg)';
                  let border = '2px solid var(--border-color)';
                  let color = 'var(--text-main)';
                  let shadow = 'var(--shadow-color)';

                  if (guessStr) {
                    letter = guessStr[colIndex];
                    if (colors[colIndex] === 'green') { 
                      bg = 'var(--primary-color)'; 
                      border = '2px solid var(--primary-color)'; 
                      color = '#fff'; 
                      shadow = '0 4px 12px var(--primary-glow)';
                    } else if (colors[colIndex] === 'yellow') { 
                      bg = '#F59E0B'; 
                      border = '2px solid #F59E0B'; 
                      color = '#fff'; 
                      shadow = '0 4px 12px rgba(245, 158, 11, 0.2)';
                    } else { 
                      bg = 'var(--card-bg-elevated)'; 
                      border = '2px solid var(--card-bg-elevated)'; 
                      color = 'var(--text-muted)'; 
                      shadow = 'none';
                    }
                  } else if (isCurrentRow && currentGuess[colIndex]) {
                    letter = currentGuess[colIndex];
                    border = '2px solid var(--text-light)';
                    bg = 'var(--card-bg-elevated)';
                  }

                  return (
                    <div key={colIndex} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: '800', backgroundColor: bg, border: border, color: color, borderRadius: '12px', textTransform: 'uppercase', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', boxShadow: shadow }}>
                      {letter}
                    </div>
                  );
                })}
              </div>
            );
          })}
          </div>
        </div>
      </div>
      {/* END GAME MODAL */}
      {status !== 'playing' && (
        <div style={{ padding: '0 20px 20px', animation: 'cardEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div className="main-card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', color: status === 'won' ? 'var(--primary-color)' : '#EF4444' }}>
              {status === 'won' ? <Trophy size={48} /> : <XCircle size={48} />}
            </div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>
              {status === 'won' ? '¡Excelente!' : '¡Casi lo logras!'}
            </h3>
            
            <div className="example-sentence-box" style={{ margin: '0 auto 24px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{targetWordObj.english}</span>
                <button className="card-audio-btn" onClick={() => speak(targetWordObj.english)}>
                  <Volume2 size={20} />
                </button>
              </div>
              <div style={{ fontSize: '1.2rem', color: 'var(--text-light)', fontWeight: '600' }}>
                {targetWordObj.spanish}
              </div>
              {targetWordObj.category && (
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                  <span className="badge-tag">{targetWordObj.category}</span>
                </div>
              )}
            </div>

            <button className="btn-primary" onClick={initGame}>
              <RotateCcw size={18} /> Jugar de nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
