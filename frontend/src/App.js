import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import creedLogo from './CREED.jpg'; 

// --- IKONY (SVG Components) ---
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const ChevronDownIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const BellIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>);
const HomeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>);
const ListIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>);
const HistoryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const KeyIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.623 5.91l-4.99 4.99a2 2 0 01-2.828 0l-1.414-1.414a2 2 0 010-2.828l4.99-4.99A6.002 6.002 0 0116 7zm-3 9a3 3 0 100-6 3 3 0 000 6z" /></svg>);

// --- DEFINICJE STYLÓW ---
const styles = {
  purpleGlow: { boxShadow: '0 0 6px rgba(167, 139, 250, 0.7), 0 0 12px rgba(167, 139, 250, 0.5)' },
  purpleGlowText: { textShadow: '0 0 8px rgba(196, 181, 253, 0.9)' },
  mainGradientText: { background: 'linear-gradient(to right, #a78bfa, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  buttonGlow: { boxShadow: '0 0 15px rgba(139, 92, 246, 0.7)' }
};


// --- KOMPONENTY UI ---

const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="w-48 h-48 rounded-full animate-pulse bg-violet-800" style={styles.purpleGlow}></div>
        <h2 className="mt-6 text-2xl font-bold" style={styles.mainGradientText}>Ładowanie danych...</h2>
        <p className="text-sm text-gray-400">Proszę czekać</p>
    </div>
);

const LoginPage = ({ onLogin }) => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [latestChangelog, setLatestChangelog] = useState(null);

  useEffect(() => {
    const fetchChangelog = async () => {
      try {
        const response = await fetch('/api/changelog/latest');
        if (response.ok) {
          const data = await response.json();
          setLatestChangelog(data);
        }
      } catch (error) { console.error('Failed to fetch latest changelog:', error); }
    };
    fetchChangelog();
  }, []);

  const handleSubmit = async (e) => { e.preventDefault(); setError(''); try { await onLogin(nickname, password); } catch (err) { setError('Nieprawidłowy nick lub hasło.'); console.error(err);}};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800/50 backdrop-blur-sm border border-violet-500/20 rounded-xl shadow-2xl shadow-violet-900/20">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white" style={styles.mainGradientText}>System Kontraktów</h2>
          <p className="mt-2 text-sm text-gray-400">Logowanie do panelu rodziny</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="nickname" className="text-sm font-medium text-gray-300">Nick z gry</label>
            <input id="nickname" name="nickname" type="text" required className="w-full px-3 py-2 mt-1 text-white bg-gray-900 border border-gray-600 rounded-md shadow-sm focus:outline-none transition-all duration-300" placeholder="np. Gregory Tyler" value={nickname} onChange={(e) => setNickname(e.target.value)} onFocus={() => setFocusedInput('nickname')} onBlur={() => setFocusedInput(null)} style={focusedInput === 'nickname' ? styles.purpleGlow : {}}/>
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-300">Hasło</label>
            <input id="password" name="password" type="password" required className="w-full px-3 py-2 mt-1 text-white bg-gray-900 border border-gray-600 rounded-md shadow-sm focus:outline-none transition-all duration-300" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)} style={focusedInput === 'password' ? styles.purpleGlow : {}}/>
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <div>
            <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-violet-600 border border-transparent rounded-md shadow-sm hover:bg-violet-500 focus:outline-none transition-all duration-300" onMouseEnter={() => setIsButtonHovered(true)} onMouseLeave={() => setIsButtonHovered(false)} style={isButtonHovered ? styles.buttonGlow : {}}>
              Zaloguj się
            </button>
          </div>
        </form>

        {latestChangelog && (
          <div className="mt-6 pt-6 border-t border-violet-500/20 text-center">
            <h4 className="text-sm font-bold text-violet-300" style={styles.purpleGlowText}>Ostatnie zmiany: {latestChangelog.version}</h4>
            <ul className="mt-2 text-xs text-gray-400 list-none space-y-1">{latestChangelog.changes.map((change, index) => (<li key={index}>- {change}</li>))}</ul>
          </div>
        )}
      </div>
    </div>
  );
};

const Sidebar = ({ users, currentUser, onSelectUser, onLogout, activeThreadUserId, availableRoles, setView, view, onMarkNotificationsAsRead, notifications, onOpenPasswordModal, changelog }) => {
  const [isThreadsVisible, setIsThreadsVisible] = useState(false);
  const [isMembersVisible, setIsMembersVisible] = useState(false);
  const [isChangelogVisible, setIsChangelogVisible] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const currentUserRoleConfig = availableRoles.find(r => r.name === currentUser.role);
  const canViewOtherThreads = currentUserRoleConfig?.canviewthreads || false;
  const usersToDisplayInThreads = canViewOtherThreads ? users.filter(u => { const userRoleConfig = availableRoles.find(r => r.name === u.role); return userRoleConfig?.isthreadvisible;}) : [currentUser];

  const NavButton = ({ icon, label, targetView }) => (
    <button onClick={() => setView(targetView)} className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 border border-transparent ${view === targetView ? 'bg-violet-500/10 text-violet-300 border-violet-500/50' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}>
        {icon}{label}
    </button>
  );

  const handleNotificationsClick = () => {
      setShowNotifications(!showNotifications);
      if (notifications.length > 0) {
          onMarkNotificationsAsRead();
      }
  };

  return (
    <div className="flex flex-col w-64 h-screen bg-gray-900 text-white border-r border-violet-500/20">
      <div className="px-4 py-3 text-xl font-bold border-b border-violet-500/20" style={styles.mainGradientText}>Panel Rodziny</div>
      <div className="flex-1 overflow-y-auto px-2">
        
        <div className="py-2 border-b border-violet-500/10">
            <button onClick={() => setIsChangelogVisible(!isChangelogVisible)} className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-700/50 rounded-md">
                <span>Historia Zmian</span>
                <ChevronDownIcon className={isChangelogVisible ? 'rotate-180' : ''} />
            </button>
            {isChangelogVisible && (
                <div className="mt-1 space-y-4 px-3 py-2 text-xs">
                    {(changelog || []).map((entry, index) => (
                        <div key={index}>
                            <p className="font-bold text-violet-300">{entry.version} <span className="font-normal text-gray-400">- {new Date(entry.date).toLocaleDateString('pl-PL')}</span></p>
                            <ul className="mt-1 list-disc list-inside text-gray-400 space-y-1">
                                {entry.changes.map((change, cIndex) => (
                                    <li key={cIndex}>{change}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <nav className="py-2 space-y-1 border-b border-violet-500/10">
            <NavButton icon={<HomeIcon/>} label="Pulpit" targetView="dashboard" />
            <NavButton icon={<ListIcon/>} label="Wątki" targetView="threads" />
            {currentUser.role === '[7] Lider' && <NavButton icon={<HistoryIcon/>} label="Historia Akcji" targetView="logs" />}
        </nav>
        
        <div className="py-2">
            <button onClick={() => setIsThreadsVisible(!isThreadsVisible)} className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-700/50 rounded-md">
                <span>Wątki</span>
                <ChevronDownIcon className={isThreadsVisible ? 'rotate-180' : ''} />
            </button>
            {isThreadsVisible && (
                <div className="mt-1 space-y-1">
                    <button onClick={() => { onSelectUser('chat'); setView('threads'); }} className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center ${activeThreadUserId === 'chat' && view === 'threads' ? 'bg-violet-500/20 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}>
                        <span className="mr-2">💬</span> Czat
                    </button>
                    {usersToDisplayInThreads.map(user => (
                        <button key={user.id} onClick={() => { onSelectUser(user.id); setView('threads'); }} className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${activeThreadUserId === user.id && view === 'threads' ? 'bg-violet-500/20 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}>
                            {user.nickname}
                        </button>
                    ))}
                </div>
            )}
        </div>

        <div className="py-2 border-t border-violet-500/10">
            <button onClick={() => setIsMembersVisible(!isMembersVisible)} className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-700/50 rounded-md">
                <span>Członkowie</span>
                <ChevronDownIcon className={isMembersVisible ? 'rotate-180' : ''} />
            </button>
            {isMembersVisible && (
                <div className="mt-1 space-y-1">
                    {users.map(user => (
                        <div key={user.id} className="w-full text-left px-3 py-1 text-sm flex items-start">
                           <span className='mr-2 text-gray-600'>•</span>
                           <div>
                                <span className="text-violet-300 font-medium">{user.nickname}</span>
                                <span className="ml-2 text-gray-500">({user.staticid})</span>
                           </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>
      <div className="p-2 border-t border-violet-500/20">
        <div className="flex items-center justify-between">
            {currentUser.role === '[7] Lider' && (
                <button onClick={() => setView('settings')} className="p-2 text-gray-400 rounded-md hover:bg-gray-700 hover:text-violet-300 transition-colors"><SettingsIcon/></button>
            )}
            <div className="relative flex-1 flex justify-end">
                <button onClick={handleNotificationsClick} className="p-2 text-gray-400 rounded-md hover:bg-gray-700 hover:text-violet-300 transition-colors relative">
                    <BellIcon/>
                    {notifications.length > 0 && <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-900"></span>}
                </button>
                {showNotifications && (
                    <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-800 border border-violet-500/30 rounded-lg shadow-lg z-10">
                        <div className="p-3 font-semibold text-white">Powiadomienia</div>
                        <div className="max-h-60 overflow-y-auto">
                            {notifications.length > 0 ? notifications.map(n => (
                                <div key={n.id} className="px-3 py-2 border-t border-violet-500/20 text-sm text-gray-300">{n.message}</div>
                            )) : <div className="px-3 py-2 text-sm text-gray-400">Brak nowych powiadomień.</div>}
                        </div>
                    </div>
                )}
            </div>
        </div>
        <div className="p-3 mt-2 text-sm bg-black/30 rounded-md">
            <p className="font-semibold">{currentUser.nickname}</p>
            <p className="text-xs text-gray-400 capitalize">Rola: {currentUser.role}</p>
        </div>
        <button onClick={onOpenPasswordModal} className="w-full flex items-center px-3 py-2 mt-2 text-sm font-medium text-left text-gray-300 rounded-md hover:bg-violet-500/20 hover:text-violet-300 transition-colors">
            <KeyIcon /> Zmień hasło
        </button>
        <button onClick={onLogout} className="w-full px-3 py-2 mt-2 text-sm font-medium text-left text-gray-300 rounded-md hover:bg-red-500/20 hover:text-red-300 transition-colors">Wyloguj</button>
      </div>
    </div>
  );
};

const ContractForm = ({ onAddContract, contractConfig }) => {
    const [contractType, setContractType] = useState(contractConfig.length > 0 ? contractConfig[0].name : '');
    const [detailedDescription, setDetailedDescription] = useState('');
    const [imageFile, setImageFile] = useState(null); 
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e) => { 
        e.preventDefault(); 
        if (contractType && imageFile) {
            setIsUploading(true);
            await onAddContract({ contractType, detailedDescription, imageFile });
            setContractType(contractConfig[0].name); 
            setDetailedDescription(''); 
            setImageFile(null);
            e.target.reset();
            setIsUploading(false);
        } else {
            alert('Proszę wybrać rodzaj kontraktu i dołączyć zrzut ekranu.');
        }
    };

    return (
        <div className="p-4 bg-gray-800 border-t-2 border-violet-500/30">
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="text-sm font-medium text-gray-300">Rodzaj kontraktu</label>
                    <select value={contractType} onChange={(e) => setContractType(e.target.value)} className="w-full px-3 py-2 mt-1 text-white bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500">{contractConfig.map(config => (<option key={config.name} value={config.name}>{config.name}</option>))}</select>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-300">Dodatkowy opis (opcjonalnie)</label>
                    <textarea placeholder="Dodatkowe informacje, wyjaśnienia..." value={detailedDescription} onChange={(e) => setDetailedDescription(e.target.value)} rows="2" className="w-full px-3 py-2 mt-1 text-white bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-300">Dowód (zrzut ekranu)</label>
                    <input 
                        type="file" 
                        accept="image/*" 
                        required 
                        onChange={(e) => setImageFile(e.target.files[0])} 
                        className="w-full mt-1 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" 
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isUploading}
                    className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-500 transition-all hover:shadow-[0_0_15px_rgba(139,92,246,0.7)] disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {isUploading ? 'Przesyłanie...' : 'Dodaj dowód'}
                </button>
            </form>
        </div>
    );
};

const AdminActions = ({ onApprove, onReject, onDelete, canApprove, canReject, canDelete }) => (
    <div className="mt-4 flex items-center space-x-2">
        {onApprove && canApprove && <button onClick={onApprove} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-500 transition-colors hover:shadow-[0_0_15px_rgba(34,197,94,0.7)]"><CheckIcon />Zatwierdź</button>}
        {onReject && canReject && <button onClick={onReject} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-500 transition-colors hover:shadow-[0_0_15px_rgba(239,68,68,0.7)]"><XIcon />Odrzuć</button>}
        {onDelete && canDelete && <button onClick={onDelete} className="p-2 text-gray-400 rounded-md hover:bg-red-500/20 hover:text-red-300 transition-colors"><TrashIcon /></button>}
    </div>
);

const RejectionModal = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');
    if (!isOpen) return null;
    const handleSubmit = () => { if (reason.trim()) { onSubmit(reason); setReason(''); } else { alert('Proszę podać powód odrzucenia.'); } };
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-violet-500/30">
                <h3 className="text-lg font-semibold text-violet-300 mb-4">Powód odrzucenia kontraktu</h3>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Wpisz powód..." rows="4" className="w-full px-3 py-2 text-white bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"></textarea>
                <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Anuluj</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500 transition-colors">Potwierdź odrzucenie</button>
                </div>
            </div>
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-violet-500/30">
                <h3 className="text-lg font-semibold text-violet-300 mb-4">{title}</h3>
                <div className="text-gray-300 mb-6">{children}</div>
                <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Anuluj</button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500 transition-colors">Potwierdź</button>
                </div>
            </div>
        </div>
    );
};

const PasswordChangeModal = ({ isOpen, onClose, onSubmit }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Nowe hasła nie są zgodne.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Nowe hasło musi mieć co najmniej 6 znaków.');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await onSubmit({ currentPassword, newPassword });
            if (result.success) {
                setSuccess(result.message);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(handleClose, 2000); 
            } else {
                setError(result.message || 'Wystąpił nieoczekiwany błąd.');
            }
        } catch (err) {
            setError(err.message || 'Wystąpił błąd podczas komunikacji z serwerem.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleClose = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-violet-500/30">
                <h3 className="text-lg font-semibold text-violet-300 mb-4">Zmiana hasła</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="password" placeholder="Obecne hasło" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="w-full px-3 py-2 text-white bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    <input type="password" placeholder="Nowe hasło" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full px-3 py-2 text-white bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    <input type="password" placeholder="Potwierdź nowe hasło" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 text-white bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    {success && <p className="text-green-400 text-sm text-center">{success}</p>}
                    
                    <div className="mt-6 flex justify-end space-x-2">
                        <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Anuluj</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Zmienianie...' : 'Zmień hasło'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ImageModal = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;
    return (<div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50" onClick={onClose}><img src={imageUrl} alt="Powiększony dowód" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl shadow-violet-500/30" /></div>);
};

const ThreadView = ({ user, contracts, onAddContract, onApproveContract, onRejectContract, onDeleteContract, currentUser, contractConfig, availableRoles, onImageClick, searchTerm, filterStatus }) => {
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, contractId: null });
  const [hoveredContract, setHoveredContract] = useState(null);

  const filteredContracts = useMemo(() => {
    if (!contracts) {
        return [];
    }
    return contracts
      .filter(c => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'pending') return !c.isapproved && !c.isrejected;
        if (filterStatus === 'approved') return c.isapproved;
        if (filterStatus === 'rejected') return c.isrejected;
        return true;
      })
      .filter(c => 
          (c.usernickname && c.usernickname.toLowerCase().includes(searchTerm.toLowerCase())) || 
          (c.detaileddescription && c.detaileddescription.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [contracts, searchTerm, filterStatus]);

  if (!user) { 
      return (<div className="flex-1 p-6 flex items-center justify-center text-gray-400">Wybierz wątek z listy po lewej stronie.</div>); 
  }
  
  const currentUserRoleConfig = availableRoles.find(r => r.name === currentUser.role);
  const handleOpenRejectModal = (contractId) => { setRejectionModal({ isOpen: true, contractId }); };
  const handleConfirmRejection = (reason) => { onRejectContract(rejectionModal.contractId, reason); setRejectionModal({ isOpen: false, contractId: null }); };
  
  return (
    <>
      <RejectionModal isOpen={rejectionModal.isOpen} onClose={() => setRejectionModal({ isOpen: false, contractId: null })} onSubmit={handleConfirmRejection} />
      <div className="flex flex-col flex-1 bg-gray-800">
          <header className="px-6 py-4 bg-gray-800 border-b-2 border-violet-500/30">
              <h2 className="text-xl font-semibold text-white">Wątek: <span style={styles.purpleGlowText}>{user.nickname}</span></h2>
              <p className="text-sm text-gray-400">Static ID: {user.staticid}</p>
          </header>
          <main className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                  {filteredContracts.length === 0 ? (
                      <p className="text-gray-400">Brak kontraktów spełniających kryteria.</p>
                  ) : (
                      filteredContracts.map(contract => (
                          <div key={contract.id} className="p-4 bg-gray-900/70 rounded-lg shadow-md border border-gray-700 transition-all duration-300" onMouseEnter={() => setHoveredContract(contract.id)} onMouseLeave={() => setHoveredContract(null)} style={hoveredContract === contract.id ? styles.purpleGlow : {}}>
                              <div className="flex items-start justify-between">
                                  <div>
                                      <h3 className="text-lg font-semibold text-violet-300">{contract.contracttype}</h3>
                                      {contract.detaileddescription && (<p className="mt-1 text-sm text-gray-300">{contract.detaileddescription}</p>)}
                                      <p className="mt-2 mb-3 text-xs text-gray-500">{new Date(contract.timestamp).toLocaleString('pl-PL')}</p>
                                  </div>
                                  <div className="flex flex-col items-end space-y-2">
                                      {contract.isapproved && (<div className="flex-shrink-0 px-3 py-1 ml-4 text-sm font-bold text-green-800 bg-green-300 rounded-full">Zatwierdzony: ${contract.payoutamount.toLocaleString('pl-PL')}</div>)}
                                      {contract.isrejected && (<div className="flex-shrink-0 px-3 py-1 ml-4 text-sm font-bold text-red-800 bg-red-300 rounded-full">Odrzucony</div>)}
                                  </div>
                              </div>
                              <img 
                                src={`/api/images/${contract.id}`} 
                                alt={`Dowód dla: ${contract.contracttype}`} 
                                className="object-cover w-full mt-2 border border-gray-600 rounded-md max-w-lg cursor-pointer transition-transform hover:scale-105" 
                                onClick={() => onImageClick(`/api/images/${contract.id}`)} 
                                onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/800x400/1f2937/ffffff?text=Błąd+ładowania+obrazka"}} 
                              />
                              {contract.isrejected && contract.rejectionreason && (<div className="mt-2 p-3 bg-red-900/50 rounded-md text-sm"><p className="font-semibold text-red-300">Powód odrzucenia:</p><p className="text-red-200">{contract.rejectionreason}</p></div>)}
                              
                              {currentUser.id !== user.id && (
                                <AdminActions 
                                    onApprove={!contract.isapproved && !contract.isrejected ? () => onApproveContract(contract.id, contract.contracttype) : null}
                                    onReject={!contract.isapproved && !contract.isrejected ? () => handleOpenRejectModal(contract.id) : null}
                                    onDelete={() => onDeleteContract(contract.id)}
                                    canApprove={currentUserRoleConfig?.canapprove}
                                    canReject={currentUserRoleConfig?.canreject}
                                    canDelete={currentUserRoleConfig?.candelete}
                                />
                              )}
                          </div>
                      ))
                  )}
              </div>
          </main>
          {currentUserRoleConfig?.isthreadvisible && user.id === currentUser.id && (<ContractForm onAddContract={onAddContract} contractConfig={contractConfig} />)}
      </div>
    </>
  );
};

const ChatView = ({ messages, currentUser, onPostMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const handleSubmit = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onPostMessage(newMessage);
            setNewMessage('');
        }
    };

    return (
        <div className="flex flex-col flex-1 bg-gray-800">
            <header className="px-6 py-4 bg-gray-800 border-b-2 border-violet-500/30">
                <h2 className="text-xl font-semibold text-white">💬 Czat Ogólny</h2>
                <p className="text-sm text-gray-400">Miejsce na luźne rozmowy i szybką komunikację.</p>
            </header>
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex flex-col items-start ${msg.user_id === currentUser.id ? 'items-end' : 'items-start'}`}>
                            <div className={`p-3 rounded-lg max-w-xl ${msg.user_id === currentUser.id ? 'bg-violet-800' : 'bg-gray-700'}`}>
                                <p className="font-semibold text-sm text-violet-300">{msg.user_nickname}</p>
                                <p className="text-white whitespace-pre-wrap">{msg.message}</p>
                                <p className="text-xs text-gray-400 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </main>
            <footer className="p-4 bg-gray-900/70 border-t-2 border-violet-500/30">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Wpisz wiadomość..."
                        className="flex-1 px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button type="submit" className="px-4 py-2 font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-500 transition-colors">Wyślij</button>
                </form>
            </footer>
        </div>
    );
};

const SettingsView = ({ users, availableRoles, contractConfig, onSaveConfig, onAddUser, onUpdateUser, onDeleteUser, token }) => {
    const [localUsers, setLocalUsers] = useState([]);
    const [localContractConfig, setLocalContractConfig] = useState([]);
    const [localAvailableRoles, setLocalAvailableRoles] = useState([]);
    const [newUser, setNewUser] = useState({ nickname: '', staticId: '', role: '[1] New Member', password: '' });

    useEffect(() => {
        setLocalUsers(JSON.parse(JSON.stringify(users || [])));
        setLocalContractConfig(JSON.parse(JSON.stringify(contractConfig || [])));
        setLocalAvailableRoles(JSON.parse(JSON.stringify(availableRoles || [])));
    }, [users, contractConfig, availableRoles]);

    const handleUserChange = (userId, field, value) => { setLocalUsers(localUsers.map(u => u.id === userId ? {...u, [field]: value} : u)); };
    const handleAddUserClick = () => { onAddUser(newUser); setNewUser({ nickname: '', staticId: '', role: '[1] New Member', password: '' }); };
    const handleUpdateUserClick = (userId) => { const user = localUsers.find(u => u.id === userId); onUpdateUser(userId, { staticId: user.staticid, role: user.role }); };
    
    const handleContractChange = (index, field, value) => { const updatedConfig = [...localContractConfig]; updatedConfig[index][field] = field === 'payout' ? parseFloat(value) || 0 : value; setLocalContractConfig(updatedConfig); };
    const handleAddContract = () => { setLocalContractConfig([...localContractConfig, { name: 'Nowy kontrakt', payout: 0}]); };
    const handleRemoveContract = (index) => { setLocalContractConfig(localContractConfig.filter((_, i) => i !== index)); };
    
    const handleRolePropChange = (index, prop, value) => { const updatedRoles = [...localAvailableRoles]; updatedRoles[index][prop] = value; setLocalAvailableRoles(updatedRoles); };
    
    return (
        <div className="flex flex-col flex-1 bg-gray-800">
            <header className="px-6 py-4 bg-gray-800 border-b-2 border-violet-500/30"><h2 className="text-xl font-semibold text-white">Panel Administracyjny</h2></header>
            <main className="flex-1 p-6 overflow-y-auto space-y-8">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Zarządzanie Członkami</h3>
                    <div className="p-4 space-y-4 bg-gray-900/70 rounded-lg border border-violet-500/30">
                        {localUsers.map(user => (
                            <div key={user.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                <span className="font-semibold">{user.nickname}</span>
                                <input type="text" value={user.staticid} onChange={(e) => handleUserChange(user.id, 'staticid', e.target.value)} className="px-2 py-1 text-sm text-white bg-gray-700 border border-gray-600 rounded-md" />
                                <select value={user.role} onChange={(e) => handleUserChange(user.id, 'role', e.target.value)} disabled={user.role === '[7] Lider'} className="px-2 py-1 text-sm text-white bg-gray-700 border border-gray-600 rounded-md disabled:opacity-50 capitalize">
                                    {localAvailableRoles.map(role => <option key={role.name} value={role.name}>{role.name}</option>)}
                                </select>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleUpdateUserClick(user.id)} className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-500">Zapisz</button>
                                    <button onClick={() => onDeleteUser(user.id)} disabled={user.role === '[7] Lider'} className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50"><TrashIcon /></button>
                                </div>
                            </div>
                        ))}
                        <div className="pt-4 mt-4 border-t border-violet-500/30 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                            <input type="text" placeholder="Nickname" value={newUser.nickname} onChange={(e) => setNewUser({...newUser, nickname: e.target.value})} className="px-2 py-1 text-sm text-white bg-gray-700 border border-gray-600 rounded-md" />
                            <input type="text" placeholder="Static ID" value={newUser.staticId} onChange={(e) => setNewUser({...newUser, staticId: e.target.value})} className="px-2 py-1 text-sm text-white bg-gray-700 border border-gray-600 rounded-md" />
                            <input type="password" placeholder="Hasło" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="px-2 py-1 text-sm text-white bg-gray-700 border border-gray-600 rounded-md" />
                            <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="px-2 py-1 text-sm text-white bg-gray-700 border border-gray-600 rounded-md capitalize">
                                {localAvailableRoles.map(role => <option key={role.name} value={role.name}>{role.name}</option>)}
                            </select>
                            <button onClick={handleAddUserClick} className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-500">Dodaj</button>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Zarządzanie Rolami</h3>
                        <div className="p-4 space-y-3 bg-gray-900/70 rounded-lg border border-violet-500/30">
                            {localAvailableRoles.map((role, index) => (
                                <div key={index} className="p-2 bg-gray-800 rounded">
                                    <p className="font-semibold capitalize">{role.name}</p>
                                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                        <label className="flex items-center"><input type="checkbox" checked={role.canviewthreads} onChange={(e) => handleRolePropChange(index, 'canviewthreads', e.target.checked)} disabled={role.name === '[7] Lider'} className="w-4 h-4 text-violet-500 bg-gray-700 border-gray-600 rounded" /><span className="ml-2">Widzi wątki</span></label>
                                        <label className="flex items-center"><input type="checkbox" checked={role.isthreadvisible} onChange={(e) => handleRolePropChange(index, 'isthreadvisible', e.target.checked)} disabled={role.name === '[7] Lider'} className="w-4 h-4 text-violet-500 bg-gray-700 border-gray-600 rounded" /><span className="ml-2">Wątek widoczny</span></label>
                                        <label className="flex items-center"><input type="checkbox" checked={role.canapprove} onChange={(e) => handleRolePropChange(index, 'canapprove', e.target.checked)} disabled={role.name === '[7] Lider'} className="w-4 h-4 text-violet-500 bg-gray-700 border-gray-600 rounded" /><span className="ml-2">Zatwierdza</span></label>
                                        <label className="flex items-center"><input type="checkbox" checked={role.canreject} onChange={(e) => handleRolePropChange(index, 'canreject', e.target.checked)} disabled={role.name === '[7] Lider'} className="w-4 h-4 text-violet-500 bg-gray-700 border-gray-600 rounded" /><span className="ml-2">Odrzuca</span></label>
                                        <label className="flex items-center"><input type="checkbox" checked={role.candelete} onChange={(e) => handleRolePropChange(index, 'candelete', e.target.checked)} disabled={role.name === '[7] Lider'} className="w-4 h-4 text-violet-500 bg-gray-700 border-gray-600 rounded" /><span className="ml-2">Usuwa</span></label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Zarządzanie Kontraktami</h3>
                        <div className="p-4 space-y-3 bg-gray-900/70 rounded-lg border border-violet-500/30">
                            {localContractConfig.map((config, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input type="text" value={config.name} onChange={(e) => handleContractChange(index, 'name', e.target.value)} className="flex-1 px-2 py-1 text-sm text-white bg-gray-700 border border-gray-600 rounded-md" />
                                    <input type="number" value={config.payout} onChange={(e) => handleContractChange(index, 'payout', e.target.value)} className="w-28 px-2 py-1 text-sm text-white bg-gray-700 border border-gray-600 rounded-md" />
                                    <button onClick={() => handleRemoveContract(index)} className="p-1 text-red-400 hover:text-red-300"><TrashIcon /></button>
                                </div>
                            ))}
                            <button onClick={handleAddContract} className="mt-4 px-3 py-1 text-sm text-white bg-violet-600 rounded-md hover:bg-violet-500">Dodaj kontrakt</button>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="p-4 bg-gray-900 border-t-2 border-violet-500/30">
                <button onClick={() => onSaveConfig({ availableRoles: localAvailableRoles, contractConfig: localContractConfig })} className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-500">Zapisz Wszystkie Zmiany Konfiguracji</button>
            </footer>
        </div>
    );
};

const DashboardView = ({ stats }) => (
    <div className="flex-1 p-6 bg-gray-800 overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6" style={styles.purpleGlowText}>Pulpit</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-900/70 rounded-lg border border-violet-500/20"><h3 className="text-sm font-medium text-gray-400">Oczekujące</h3><p className="mt-1 text-3xl font-semibold text-white">{stats.pending}</p></div>
            <div className="p-4 bg-gray-900/70 rounded-lg border border-green-500/20"><h3 className="text-sm font-medium text-gray-400">Zatwierdzone</h3><p className="mt-1 text-3xl font-semibold text-white">{stats.approved}</p></div>
            <div className="p-4 bg-gray-900/70 rounded-lg border border-red-500/20"><h3 className="text-sm font-medium text-gray-400">Odrzucone</h3><p className="mt-1 text-3xl font-semibold text-white">{stats.rejected}</p></div>
        </div>
        <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Najlepsi wykonawcy</h3>
            <div className="bg-gray-900/70 rounded-lg border border-violet-500/20">
                <ul className="divide-y divide-gray-700">
                    {stats.topPerformers.map((performer, index) => (
                        <li key={index} className="p-4 flex justify-between items-center">
                            <span className="font-medium text-violet-300">{performer.usernickname}</span>
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Zarobiono: <span className="font-semibold text-white">${performer.totalpayout.toLocaleString('pl-PL')}</span></p>
                                <p className="text-xs text-gray-500">{performer.count} kontraktów</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);

const LogsView = ({ logs }) => (
    <div className="flex-1 p-6 bg-gray-800 overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6" style={styles.purpleGlowText}>Historia Akcji</h2>
        <div className="space-y-3">
            {logs.map(log => (
                <div key={log.id} className="p-3 bg-gray-900/70 rounded-md border border-violet-500/20">
                    <p className="text-sm text-gray-300"><span className="font-bold text-violet-300">{log.actor_nickname}</span> {log.action_description}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(log.timestamp).toLocaleString('pl-PL')}</p>
                </div>
            ))}
        </div>
    </div>
);


// --- GŁÓWNY KOMPONENT APLIKACJI (POPRAWIONY) ---

export default function App() {
  const [appData, setAppData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [activeThreadUserId, setActiveThreadUserId] = useState(null);
  const [zoomedImageUrl, setZoomedImageUrl] = useState(null);
  const [view, setView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmation, setConfirmation] = useState({ isOpen: false, onConfirm: () => {}, title: '', message: '' });
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const API_URL = '';

  const dashboardStats = useMemo(() => {
      if (!appData || !appData.contracts) {
          return { pending: 0, approved: 0, rejected: 0, topPerformers: [] };
      }
      const { contracts } = appData;
      const approved = contracts.filter(c => c.isapproved);
      const performers = approved.reduce((acc, c) => {
          acc[c.usernickname] = acc[c.usernickname] || { count: 0, totalpayout: 0 };
          acc[c.usernickname].count++;
          acc[c.usernickname].totalpayout += c.payoutamount;
          return acc;
      }, {});

      return {
          pending: contracts.filter(c => !c.isapproved && !c.isrejected).length,
          approved: approved.length,
          rejected: contracts.filter(c => c.isrejected).length,
          topPerformers: Object.entries(performers).map(([name, data]) => ({ usernickname: name, ...data })).sort((a, b) => b.totalpayout - a.totalpayout).slice(0, 5),
      }
  }, [appData]);

  const handleLogout = useCallback(() => { 
      localStorage.removeItem('token'); 
      setToken(null); 
      setCurrentUser(null); 
      setAppData(null);
      setView('dashboard');
      setIsLoading(false);
  }, []);

  const fetchData = useCallback(async (currentToken) => {
    if (!currentToken) { setIsLoading(false); return; }
    try {
      const response = await fetch(`${API_URL}/api/data`, { headers: { 'Authorization': `Bearer ${currentToken}` } });
      if (response.status === 401 || response.status === 403) { handleLogout(); return; }
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setAppData(data);
      const decodedToken = JSON.parse(atob(currentToken.split('.')[1]));
      const userFromToken = data.users.find(u => u.id === decodedToken.id);
      setCurrentUser(userFromToken);
      if (!activeThreadUserId && userFromToken) { setActiveThreadUserId(userFromToken.id); }
    } catch (error) { 
        console.error("Failed to fetch data:", error); 
        handleLogout(); 
    } finally {
        setIsLoading(false);
    }
  }, [activeThreadUserId, handleLogout]);
  
  useEffect(() => {
      fetchData(token);
  }, [token, fetchData]);

  const handleLogin = async (nickname, password) => {
    setIsLoading(true);
    const timerPromise = new Promise(resolve => setTimeout(resolve, 1500));
    try {
        const response = await fetch(`${API_URL}/api/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nickname, password }) });
        if (!response.ok) throw new Error('Login failed');
        const { token: newToken } = await response.json();
        localStorage.setItem('token', newToken);
        setToken(newToken);
    } catch (error) {
        console.error(error);
        setIsLoading(false);
        throw error;
    } finally {
        await timerPromise;
    }
  };

  const handleAddContract = async (newContractData) => {
    const { contractType, detailedDescription, imageFile } = newContractData;
    const formData = new FormData();
    formData.append('userNickname', currentUser.nickname);
    formData.append('contractType', contractType);
    formData.append('detailedDescription', detailedDescription);
    formData.append('image', imageFile);
    try {
        await fetch(`${API_URL}/api/contracts`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
        fetchData(token);
    } catch (error) {
        console.error("Failed to add contract:", error);
        alert("Wystąpił błąd podczas dodawania kontraktu.");
    }
  };

  const handlePostChatMessage = async (message) => {
      try {
          await fetch(`${API_URL}/api/chat`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ message })
          });
          fetchData(token);
      } catch (error) {
          console.error("Failed to post chat message:", error);
          alert("Wystąpił błąd podczas wysyłania wiadomości.");
      }
  };

  const handleApproveContract = async (contractId, contractType) => { 
      const config = appData.contractConfig.find(c => c.name === contractType); 
      const amount = config ? config.payout : 0; 
      await fetch(`${API_URL}/api/contracts/${contractId}/approve`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ payoutAmount: amount }) }); 
      fetchData(token); 
  };
  
  const handleRejectContract = async (contractId, reason) => { 
      await fetch(`${API_URL}/api/contracts/${contractId}/reject`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ rejectionReason: reason }) }); 
      fetchData(token); 
  };
  
  const handleDeleteContract = (contractId) => {
      setConfirmation({
          isOpen: true,
          title: "Potwierdź usunięcie",
          message: "Czy na pewno chcesz trwale usunąć ten kontrakt?",
          onConfirm: async () => {
              await fetch(`${API_URL}/api/contracts/${contractId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
              fetchData(token);
              setConfirmation({ isOpen: false, onConfirm: () => {}, title: '', message: '' });
          }
      });
  };

  const handleMarkNotificationsAsRead = async () => {
      await fetch(`${API_URL}/api/notifications/read`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
      fetchData(token);
  };

  const handleChangePassword = async (passwordData) => {
      try {
          const response = await fetch(`${API_URL}/api/user/password`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(passwordData)
          });
          const result = await response.json();
          if (!response.ok) {
              throw new Error(result.message || 'Nie udało się zmienić hasła.');
          }
          return { success: true, message: result.message };
      } catch (error) {
          console.error("Failed to change password:", error);
          return { success: false, message: error.toString() };
      }
  };

  // --- ADMIN HANDLERS ---
  const handleSaveConfig = async (config) => {
      await fetch(`${API_URL}/api/admin/config`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(config) });
      fetchData(token);
      alert('Konfiguracja zapisana!');
  };
  const handleAddUser = async (userData) => {
      await fetch(`${API_URL}/api/admin/users`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(userData) });
      fetchData(token);
  };
  const handleUpdateUser = async (userId, userData) => {
      await fetch(`${API_URL}/api/admin/users/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(userData) });
      fetchData(token);
  };
  const onDeleteUser = (userId) => {
      setConfirmation({
          isOpen: true,
          title: "Potwierdź usunięcie użytkownika",
          message: "Czy na pewno chcesz usunąć tego użytkownika? Ta akcja jest nieodwracalna.",
          onConfirm: async () => {
              await fetch(`${API_URL}/api/admin/users/${userId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
              fetchData(token);
              setConfirmation({ isOpen: false, onConfirm: () => {}, title: '', message: '' });
          }
      });
  };

  if (isLoading) { return <LoadingScreen />; }
  if (!currentUser || !appData) { return <LoginPage onLogin={handleLogin} />; }

  const { users, contracts, contractConfig, availableRoles, changelog, notifications, logs, chat } = appData;
  const activeUser = users.find(u => u.id === activeThreadUserId);
  const activeContracts = contracts.filter(c => c.userid === activeThreadUserId);

  const renderView = () => {
      switch(view) {
          case 'dashboard':
              return <DashboardView stats={dashboardStats} />;
          case 'threads':
              if (activeThreadUserId === 'chat') {
                  return <ChatView messages={chat || []} currentUser={currentUser} onPostMessage={handlePostChatMessage} />;
              }
              return (
                <div className="flex flex-col flex-1 bg-gray-800">
                    <div className="p-4 border-b-2 border-violet-500/30">
                        <input type="text" placeholder="Szukaj po nicku lub opisie..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-3 py-2 text-white bg-gray-900 border border-gray-600 rounded-md"/>
                        <div className="flex space-x-2 mt-2">
                            <button onClick={() => setFilterStatus('all')} className={`px-3 py-1 rounded-md text-sm ${filterStatus === 'all' ? 'bg-violet-600' : 'bg-gray-700'}`}>Wszystkie</button>
                            <button onClick={() => setFilterStatus('pending')} className={`px-3 py-1 rounded-md text-sm ${filterStatus === 'pending' ? 'bg-violet-600' : 'bg-gray-700'}`}>Oczekujące</button>
                            <button onClick={() => setFilterStatus('approved')} className={`px-3 py-1 rounded-md text-sm ${filterStatus === 'approved' ? 'bg-violet-600' : 'bg-gray-700'}`}>Zatwierdzone</button>
                            <button onClick={() => setFilterStatus('rejected')} className={`px-3 py-1 rounded-md text-sm ${filterStatus === 'rejected' ? 'bg-violet-600' : 'bg-gray-700'}`}>Odrzucone</button>
                        </div>
                    </div>
                    <ThreadView 
                        user={activeUser} 
                        contracts={activeContracts} 
                        onAddContract={handleAddContract} 
                        onApproveContract={handleApproveContract} 
                        onRejectContract={handleRejectContract} 
                        onDeleteContract={handleDeleteContract}
                        currentUser={currentUser} 
                        contractConfig={contractConfig} 
                        availableRoles={availableRoles} 
                        onImageClick={setZoomedImageUrl}
                        searchTerm={searchTerm}
                        filterStatus={filterStatus} 
                    />
                </div>
              );
          case 'settings':
              return <SettingsView users={users} availableRoles={availableRoles} contractConfig={contractConfig} onSaveConfig={handleSaveConfig} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={onDeleteUser} token={token} />;
          case 'logs':
              return <LogsView logs={logs} />;
          default:
              return <DashboardView stats={dashboardStats} />;
      }
  };

  return (
    <div className="flex h-screen font-sans bg-gray-800 text-white">
      <ImageModal imageUrl={zoomedImageUrl} onClose={() => setZoomedImageUrl(null)} />
      <ConfirmationModal 
          isOpen={confirmation.isOpen}
          onClose={() => setConfirmation({ isOpen: false, onConfirm: () => {}, title: '', message: '' })}
          onConfirm={confirmation.onConfirm}
          title={confirmation.title}
      >
          {confirmation.message}
      </ConfirmationModal>
      <PasswordChangeModal
          isOpen={isPasswordModalOpen}
          onClose={() => setPasswordModalOpen(false)}
          onSubmit={handleChangePassword}
      />
      <Sidebar 
        users={users} 
        currentUser={currentUser} 
        onSelectUser={setActiveThreadUserId} 
        onLogout={handleLogout} 
        activeThreadUserId={activeThreadUserId} 
        availableRoles={availableRoles} 
        notifications={notifications || []} 
        setView={setView} 
        view={view} 
        onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
        onOpenPasswordModal={() => setPasswordModalOpen(true)}
        changelog={changelog}
      />
      <div className="flex-1 flex flex-col">
          {renderView()}
      </div>
    </div>
  );
}
