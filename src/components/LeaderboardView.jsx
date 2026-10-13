// src/components/LeaderboardView.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Trophy, 
  Users, 
  Globe, 
  Flame, 
  Sparkles, 
  Share2, 
  UserPlus, 
  Edit3, 
  Check, 
  X, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { 
  getUserProfile, 
  saveUserProfile, 
  syncUserProgress, 
  getGlobalLeaderboard, 
  getFriendsLeaderboard, 
  addFriendLocally, 
  removeFriendLocally, 
  getSavedFriends, 
  generateFriendShareData,
  AVATAR_LIST 
} from '../services/leaderboardService';
import { isConfigured, reinitializeFirebase } from '../services/firebase';
import { saveFirebaseCustomConfig } from '../services/firebaseConfig';
import { triggerHaptic } from '../utils/helpers';

export default function LeaderboardView({ streakCount = 0, wordsMastered = 0, phrasesMastered = 0, todayActivities = {} }) {
  const [activeSubTab, setActiveSubTab] = useState('global'); // 'global' | 'friends'
  const [profile, setProfile] = useState(getUserProfile);
  const [leaderboardList, setLeaderboardList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(() => !profile.hasCustomized);
  const [tempName, setTempName] = useState(profile.name);
  const [tempAvatar, setTempAvatar] = useState(profile.avatar);
  const [friendInput, setFriendInput] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customConfigJson, setCustomConfigJson] = useState('');
  const [configSuccessMsg, setConfigSuccessMsg] = useState('');

  // Sincronizar y recargar datos del ranking
  const loadLeaderboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Sincronizar nuestro puntaje más reciente
      const myScore = await syncUserProgress({
        streak: streakCount,
        wordsMastered,
        phrasesMastered,
        todayActivities
      });

      // 2. Obtener la lista según la pestaña activa
      if (activeSubTab === 'global') {
        const list = await getGlobalLeaderboard(myScore);
        setLeaderboardList(list);
      } else {
        const list = await getFriendsLeaderboard(myScore);
        setLeaderboardList(list);
      }
    } catch (err) {
      console.warn('Error loading leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeSubTab, streakCount, wordsMastered, phrasesMastered, todayActivities]);

  useEffect(() => {
    loadLeaderboardData();
  }, [loadLeaderboardData]);

  // Manejar compartir enlace de amigo
  const handleShareProfile = async () => {
    triggerHaptic(25);
    const shareData = generateFriendShareData();

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {}
    }

    // Fallback: copiar enlace al portapapeles
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareData.url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      } catch {}
    }
  };

  // Guardar nuevo nombre y avatar
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    triggerHaptic(30);

    const updated = await saveUserProfile(tempName, tempAvatar);
    setProfile(updated);
    setShowEditProfile(false);
    loadLeaderboardData();
  };

  // Agregar amigo manualmente por ID o Nombre
  const handleAddFriend = (e) => {
    e.preventDefault();
    if (!friendInput.trim()) return;
    triggerHaptic(20);

    const friendId = friendInput.trim();
    addFriendLocally({
      userId: friendId,
      name: friendId.startsWith('user_') ? 'Compañero' : friendId,
      avatar: '⚡'
    });

    setFriendInput('');
    if (activeSubTab === 'friends') {
      loadLeaderboardData();
    } else {
      setActiveSubTab('friends');
    }
  };

  // Guardar configuración personalizada de Firebase
  const handleSaveFirebaseConfig = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(customConfigJson);
      if (parsed.projectId && (parsed.apiKey || parsed.apiKey === '')) {
        saveFirebaseCustomConfig(parsed);
        reinitializeFirebase();
        setConfigSuccessMsg('¡Configuración guardada! Reiniciando conexión...');
        setTimeout(() => {
          setShowConfigModal(false);
          setConfigSuccessMsg('');
          window.location.reload();
        }, 1200);
      } else {
        alert('El JSON de Firebase debe incluir al menos "projectId" y "apiKey".');
      }
    } catch {
      alert('Formato JSON inválido. Copia el objeto firebaseConfig tal cual te lo da la consola de Firebase.');
    }
  };

  // Identificar posición del usuario actual
  const myRankIndex = useMemo(() => {
    return leaderboardList.findIndex(item => item.userId === profile.userId);
  }, [leaderboardList, profile.userId]);

  const topThree = useMemo(() => {
    return leaderboardList.slice(0, 3);
  }, [leaderboardList]);

  const restList = useMemo(() => {
    return leaderboardList.slice(3);
  }, [leaderboardList]);

  return (
    <div className="leaderboard-container animate-fade-in">
      {/* Header & Title */}
      <div className="leaderboard-header">
        <div className="leaderboard-title-group">
          <div className="leaderboard-trophy-icon">
            <Trophy size={28} color="#F59E0B" />
          </div>
          <div>
            <h1 className="leaderboard-title">Ranking & Comunidad</h1>
            <p className="leaderboard-subtitle">Compara tu racha y nivel de inglés con otros estudiantes</p>
          </div>
        </div>

        {/* Tab Selector: Global vs Amigos */}
        <div className="leaderboard-segmented-tabs">
          <button 
            className={`leaderboard-tab-btn ${activeSubTab === 'global' ? 'active' : ''}`}
            onClick={() => { setActiveSubTab('global'); triggerHaptic(15); }}
          >
            <Globe size={16} />
            <span>Ranking Global</span>
          </button>
          <button 
            className={`leaderboard-tab-btn ${activeSubTab === 'friends' ? 'active' : ''}`}
            onClick={() => { setActiveSubTab('friends'); triggerHaptic(15); }}
          >
            <Users size={16} />
            <span>Mis Amigos ({getSavedFriends().length})</span>
          </button>
        </div>
      </div>

      {/* User Status Card */}
      <div className="my-status-card">
        <div className="my-status-avatar-wrapper" onClick={() => setShowEditProfile(true)}>
          <span className="my-status-avatar">{profile.avatar}</span>
          <button className="my-status-edit-badge" title="Cambiar avatar y nombre">
            <Edit3 size={11} />
          </button>
        </div>

        <div className="my-status-info">
          <div className="my-status-name-row">
            <span className="my-status-name">{profile.name}</span>
            <span className="my-status-you-tag">Tú</span>
          </div>
          <div className="my-status-stats">
            <span className="my-status-stat-pill streak">
              <Flame size={13} color="#F59E0B" fill="#F59E0B" /> {streakCount}d racha
            </span>
            <span className="my-status-stat-pill xp">
              <Sparkles size={13} color="var(--primary-color)" /> {leaderboardList[myRankIndex]?.xp || 0} XP
            </span>
          </div>
        </div>

        <div className="my-status-rank">
          <span className="my-status-rank-label">Tu Puesto</span>
          <span className="my-status-rank-number">
            #{myRankIndex >= 0 ? myRankIndex + 1 : '-'}
          </span>
        </div>
      </div>

      {/* Friends Actions Row */}
      <div className="friends-actions-bar">
        <button className="btn-share-friend" onClick={handleShareProfile}>
          <Share2 size={16} />
          <span>{copySuccess ? '¡Enlace copiado!' : 'Invitar amigos / Compartir'}</span>
        </button>

        <form className="add-friend-form" onSubmit={handleAddFriend}>
          <input 
            type="text" 
            placeholder="Pegar ID o código de amigo..."
            value={friendInput}
            onChange={(e) => setFriendInput(e.target.value)}
            className="add-friend-input"
          />
          <button type="submit" className="btn-add-friend" title="Agregar a amigos">
            <UserPlus size={16} />
          </button>
        </form>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="leaderboard-loading">
          <RefreshCw size={24} className="spin-animation" color="var(--primary-color)" />
          <span>Actualizando posiciones en vivo...</span>
        </div>
      ) : leaderboardList.length === 0 ? (
        <div className="leaderboard-empty-state">
          <Users size={40} color="var(--text-muted)" />
          <h3>Aún no tienes amigos agregados</h3>
          <p>Toca en <strong>"Invitar amigos"</strong> para enviarles tu enlace por WhatsApp o pega el código de un amigo arriba.</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Display */}
          {topThree.length > 0 && (
            <div className="podium-container">
              {/* #2 Silver (Left) */}
              {topThree[1] && (
                <div className={`podium-card rank-2 ${topThree[1].userId === profile.userId ? 'is-me' : ''}`}>
                  <div className="podium-crown silver">🥈 #2</div>
                  <div className="podium-avatar">{topThree[1].avatar}</div>
                  <div className="podium-name">{topThree[1].name}</div>
                  <div className="podium-xp">{topThree[1].xp} XP</div>
                  <div className="podium-streak">
                    <Flame size={12} color="#F59E0B" fill="#F59E0B" /> {topThree[1].streak}d
                  </div>
                  <div className="podium-pillar pillar-silver" />
                </div>
              )}

              {/* #1 Gold (Center Elevated) */}
              {topThree[0] && (
                <div className={`podium-card rank-1 ${topThree[0].userId === profile.userId ? 'is-me' : ''}`}>
                  <div className="podium-crown gold">👑 #1</div>
                  <div className="podium-avatar first-place">{topThree[0].avatar}</div>
                  <div className="podium-name">{topThree[0].name}</div>
                  <div className="podium-xp">{topThree[0].xp} XP</div>
                  <div className="podium-streak">
                    <Flame size={12} color="#F59E0B" fill="#F59E0B" /> {topThree[0].streak}d
                  </div>
                  <div className="podium-pillar pillar-gold" />
                </div>
              )}

              {/* #3 Bronze (Right) */}
              {topThree[2] && (
                <div className={`podium-card rank-3 ${topThree[2].userId === profile.userId ? 'is-me' : ''}`}>
                  <div className="podium-crown bronze">🥉 #3</div>
                  <div className="podium-avatar">{topThree[2].avatar}</div>
                  <div className="podium-name">{topThree[2].name}</div>
                  <div className="podium-xp">{topThree[2].xp} XP</div>
                  <div className="podium-streak">
                    <Flame size={12} color="#F59E0B" fill="#F59E0B" /> {topThree[2].streak}d
                  </div>
                  <div className="podium-pillar pillar-bronze" />
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Table List (#4 onwards) */}
          <div className="leaderboard-list">
            {restList.map((item, idx) => {
              const rankNum = idx + 4;
              const isMe = item.userId === profile.userId;

              return (
                <div key={item.userId || idx} className={`leaderboard-row ${isMe ? 'is-me' : ''}`}>
                  <div className="leaderboard-row-rank">
                    <span>#{rankNum}</span>
                  </div>

                  <div className="leaderboard-row-avatar">
                    <span>{item.avatar || '👤'}</span>
                  </div>

                  <div className="leaderboard-row-info">
                    <div className="leaderboard-row-name">
                      <span>{item.name}</span>
                      {isMe && <span className="you-chip">Tú</span>}
                    </div>
                    <div className="leaderboard-row-details">
                      <span className="row-streak-chip">
                        <Flame size={11} color="#F59E0B" fill="#F59E0B" /> {item.streak || 0}d
                      </span>
                      {item.wordsMastered > 0 && (
                        <span className="row-words-chip">
                          📚 {item.wordsMastered} pal.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="leaderboard-row-xp">
                    <strong>{item.xp || 0}</strong>
                    <span className="xp-label">XP</span>
                  </div>

                  {activeSubTab === 'friends' && !isMe && (
                    <button 
                      className="btn-remove-friend"
                      onClick={() => { removeFriendLocally(item.userId); loadLeaderboardData(); }}
                      title="Eliminar de amigos"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Cloud Status Footer Pill */}
      <div className="cloud-status-footer">
        {isConfigured ? (
          <div className="cloud-status-pill connected">
            <ShieldCheck size={14} color="#10B981" />
            <span>Sincronizado con Google Cloud (Firebase)</span>
          </div>
        ) : (
          <button className="cloud-status-pill pending" onClick={() => setShowConfigModal(true)}>
            <Sparkles size={14} color="#F59E0B" />
            <span>Configurar Google Firebase en 1 clic</span>
          </button>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="modal-overlay" onClick={() => profile.hasCustomized && setShowEditProfile(false)}>
          <div className="modal-sheet profile-edit-modal animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="sheet-drag-handle" />
            <div className="modal-header">
              <h2 className="modal-title">Tu Perfil de Estudiante</h2>
              {profile.hasCustomized && (
                <button className="btn-icon" onClick={() => setShowEditProfile(false)}>
                  <X size={18} />
                </button>
              )}
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Elige tu apodo y tu avatar para que tus amigos te reconozcan en el ranking.
            </p>

            <form onSubmit={handleSaveProfile}>
              <div className="profile-input-group">
                <label className="profile-label">Tu Nombre o Apodo:</label>
                <input 
                  type="text" 
                  maxLength={24}
                  required
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Ej: Facu, Alex_English..."
                  className="profile-name-input"
                />
              </div>

              <div className="profile-avatar-section">
                <label className="profile-label">Elige tu Avatar:</label>
                <div className="avatar-grid">
                  {AVATAR_LIST.map((av) => (
                    <button
                      key={av}
                      type="button"
                      className={`avatar-option-btn ${tempAvatar === av ? 'selected' : ''}`}
                      onClick={() => setTempAvatar(av)}
                    >
                      <span>{av}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '20px' }}>
                <Check size={18} />
                <span>Guardar y Unirme al Ranking</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Firebase Cloud Setup Modal */}
      {showConfigModal && (
        <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
          <div className="modal-sheet animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="sheet-drag-handle" />
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--primary-color)" />
                <h2 className="modal-title">Vincular Google Firebase</h2>
              </div>
              <button className="btn-icon" onClick={() => setShowConfigModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '12px' }}>
              Para que tu base de datos esté 100% activa en tiempo real entre todos tus amigos de forma gratuita, crea un proyecto en <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Firebase Console</a> y pega el objeto de configuración aquí:
            </p>

            <form onSubmit={handleSaveFirebaseConfig}>
              <textarea 
                className="firebase-config-textarea"
                rows={7}
                placeholder={`{\n  "apiKey": "AIzaSy...",\n  "projectId": "english-learning-...",\n  "storageBucket": "..."\n}`}
                value={customConfigJson}
                onChange={(e) => setCustomConfigJson(e.target.value)}
              />

              {configSuccessMsg && (
                <div style={{ color: '#10B981', fontSize: '13px', fontWeight: 'bold', margin: '8px 0' }}>
                  {configSuccessMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowConfigModal(false)} style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                  <Check size={16} />
                  <span>Conectar Base de Datos</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
