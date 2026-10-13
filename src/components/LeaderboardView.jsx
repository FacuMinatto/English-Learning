// src/components/LeaderboardView.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
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
import { isConfigured } from '../services/firebase';
import { triggerHaptic } from '../utils/helpers';

export default function LeaderboardView({ streakCount = 0, wordsMastered = 0, phrasesMastered = 0, todayActivities = {} }) {
  const [activeSubTab, setActiveSubTab] = useState('global'); // 'global' | 'friends'
  const [profile, setProfile] = useState(getUserProfile);
  const [leaderboardList, setLeaderboardList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(() => !getUserProfile().hasCustomized);
  const [tempName, setTempName] = useState(profile.name);
  const [tempAvatar, setTempAvatar] = useState(profile.avatar);
  const [friendInput, setFriendInput] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

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

  // Identificar posición del usuario actual
  const myRankIndex = useMemo(() => {
    return leaderboardList.findIndex(item => item.userId === profile.userId);
  }, [leaderboardList, profile.userId]);

  const hasFullPodium = leaderboardList.length >= 3;
  const topThree = useMemo(() => {
    return hasFullPodium ? leaderboardList.slice(0, 3) : [];
  }, [leaderboardList, hasFullPodium]);

  const displayedList = useMemo(() => {
    return hasFullPodium ? leaderboardList.slice(3) : leaderboardList;
  }, [leaderboardList, hasFullPodium]);

  return (
    <div className="leaderboard-container animate-fade-in">
      {/* Tab Selector: Global vs Amigos (Sleek full-width design) */}
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

      {/* Friends Actions Section (Cleanly stacked, 0 horizontal overflow) */}
      <div className="friends-actions-section">
        <button className="btn-share-friend-primary" onClick={handleShareProfile}>
          <Share2 size={16} />
          <span>{copySuccess ? '¡Enlace copiado al portapapeles! 📋' : 'Invitar amigos / Compartir por WhatsApp'}</span>
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
            <UserPlus size={15} />
            <span>Agregar</span>
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
          {/* Top 3 Podium Display (Only if 3 or more users exist) */}
          {hasFullPodium && (
            <div className="podium-container">
              {/* #2 Silver (Left) */}
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

              {/* #1 Gold (Center Elevated) */}
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

              {/* #3 Bronze (Right) */}
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
            </div>
          )}

          {/* Banner when only 1 user */}
          {leaderboardList.length === 1 && (
            <div className="invite-friends-banner">
              <span className="invite-banner-emoji">🚀</span>
              <div>
                <strong>¡Estás en el puesto #1!</strong>
                <p>
                  {activeSubTab === 'friends'
                    ? 'Invita a tus amigos con el botón de arriba para ver quién acumula más días de racha.'
                    : 'Comparte la app con tus amigos o compañeros para ver quién lidera el podio global.'}
                </p>
              </div>
            </div>
          )}

          {/* Leaderboard Rows List */}
          <div className="leaderboard-list">
            {displayedList.map((item, idx) => {
              const rankNum = hasFullPodium ? idx + 4 : idx + 1;
              const isMe = item.userId === profile.userId;

              return (
                <div key={item.userId || idx} className={`leaderboard-row ${isMe ? 'is-me' : ''}`}>
                  <div className="leaderboard-row-rank">
                    {rankNum === 1 ? (
                      <span className="rank-badge-gold">👑 1</span>
                    ) : rankNum === 2 ? (
                      <span className="rank-badge-silver">🥈 2</span>
                    ) : rankNum === 3 ? (
                      <span className="rank-badge-bronze">🥉 3</span>
                    ) : (
                      <span>#{rankNum}</span>
                    )}
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
                        <Flame size={11} color="#F59E0B" fill="#F59E0B" /> {item.streak || 0}d racha
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
          <div className="cloud-status-pill local">
            <Sparkles size={14} color="#F59E0B" />
            <span>Modo Local / Simulado</span>
          </div>
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
    </div>
  );
}
