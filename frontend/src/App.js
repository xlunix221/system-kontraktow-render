import React, { useState, useEffect, useCallback } from 'react';

// --- IKONY ---
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const ChevronDownIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);

// --- DEFINICJE STYLÓW ---
const styles = {
  purpleGlow: {
    boxShadow: '0 0 6px rgba(167, 139, 250, 0.7), 0 0 12px rgba(167, 139, 250, 0.5)',
  },
  purpleGlowText: {
    textShadow: '0 0 8px rgba(196, 181, 253, 0.9)',
  },
  mainGradientText: {
    background: 'linear-gradient(to right, #a78bfa, #c4b5fd)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  buttonGlow: {
    boxShadow: '0 0 15px rgba(139, 92, 246, 0.7)',
  }
};


// --- KOMPONENTY APLIKACJI ---

const LoginPage = ({ onLogin }) => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handleSubmit = async (e) => { e.preventDefault(); setError(''); try { await onLogin(nickname, password); } catch (err) { setError('Nieprawidłowy nick lub hasło.'); console.error(err);}};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
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
      </div>
    </div>
  );
};

const Sidebar = ({ users, currentUser, onSelectUser, onLogout, activeThreadUserId, availableRoles, changelog }) => {
  const [isChangelogVisible, setIsChangelogVisible] = useState(false);
  const [isThreadsVisible, setIsThreadsVisible] = useState(true);
  const [isMembersVisible, setIsMembersVisible] = useState(true);

  const currentUserRoleConfig = availableRoles.find(r => r.name === currentUser.role);
  const canViewOtherThreads = currentUserRoleConfig?.canviewthreads || false;
  const usersToDisplayInThreads = canViewOtherThreads ? users.filter(u => { const userRoleConfig = availableRoles.find(r => r.name === u.role); return userRoleConfig?.isthreadvisible;}) : [currentUser];

  const CollapsibleSection = ({ title, isVisible, onToggle, children }) => (
    <div className="border-b border-violet-500/10">
      <button onClick={onToggle} className="flex items-center justify-between w-full px-2 py-3 text-left transition-colors hover:text-violet-300">
        <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">{title}</p>
        <ChevronDownIcon className={!isVisible && '-rotate-90'} />
      </button>
      <div className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${isVisible ? 'max-h-[500px]' : 'max-h-0'}`}>
        <div className="pb-2 px-1 space-y-1">
            {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col w-64 h-screen bg-gray-900 text-white border-r border-violet-500/20">
      <div className="px-4 py-3 text-xl font-bold border-b border-violet-500/20" style={styles.mainGradientText}>Panel Rodziny</div>
      <div className="flex-1 overflow-y-auto px-2">
        <CollapsibleSection title="Changelog" isVisible={isChangelogVisible} onToggle={() => setIsChangelogVisible(!isChangelogVisible)}><div className="p-2 space-y-3 text-xs text-gray-300 bg-black/30 rounded-md">{changelog.map(entry => (<div key={entry.version}><p className="font-bold text-violet-300">{entry.version} <span className="font-normal text-gray-400">({entry.date})</span></p><ul className="pl-3 mt-1 list-disc list-inside">{entry.changes.map((change, index) => <li key={index}>{change}</li>)}</ul></div>))}</div></CollapsibleSection>
        <CollapsibleSection title={canViewOtherThreads ? 'Wątki członków' : 'Mój wątek'} isVisible={isThreadsVisible} onToggle={() => setIsThreadsVisible(!isThreadsVisible)}>{usersToDisplayInThreads.map(user => (<a key={user.id} href="#" onClick={(e) => { e.preventDefault(); onSelectUser(user.id); }} className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 border border-transparent ${user.id === activeThreadUserId ? 'bg-violet-500/10 text-violet-300 border-violet-500/50' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}>{user.nickname}</a>))}</CollapsibleSection>
        <CollapsibleSection title="Lista Członków" isVisible={isMembersVisible} onToggle={() => setIsMembersVisible(!isMembersVisible)}>{users.map(user => (<div key={user.id} className="px-3 py-2 text-sm text-gray-300 rounded-md bg-black/30"><p className="font-semibold text-white">{user.nickname}</p><div className="flex justify-between text-xs text-violet-300/80"><span>{user.role}</span><span>ID: {user.staticid}</span></div></div>))}</CollapsibleSection>
      </div>
      <div className="p-2 border-t border-violet-500/20">
        <div className="p-3 text-sm bg-black/30 rounded-md"><p className="font-semibold">{currentUser.nickname}</p><p className="text-xs text-gray-400 capitalize">Rola: {currentUser.role}</p></div>
        <button onClick={onLogout} className="w-full px-3 py-2 mt-2 text-sm font-medium text-left text-gray-300 rounded-md hover:bg-red-500/20 hover:text-red-300 transition-colors">Wyloguj</button>
      </div>
    </div>
  );
};

const ContractForm = ({ onAddContract, contractConfig }) => {
    const [contractType, setContractType] = useState(contractConfig.length > 0 ? contractConfig[0].name : '');
    const [detailedDescription, setDetailedDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); if (contractType && imageUrl) { onAddContract({ contractType, detailedDescription, imageUrl }); setContractType(contractConfig[0].name); setDetailedDescription(''); setImageUrl(''); } };
    return (
      <div className="p-4 bg-gray-800 border-t-2 border-violet-500/30"><form onSubmit={handleSubmit} className="space-y-3"><div><label className="text-sm font-medium text-gray-300">Rodzaj kontraktu</label><select value={contractType} onChange={(e) => setContractType(e.target.value)} className="w-full px-3 py-2 mt-1 text-white bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500">{contractConfig.map(config => (<option key={config.name} value={config.name}>{config.name}</option>))}</select></div><div><label className="text-sm font-medium text-gray-300">Dodatkowy opis (opcjonalnie)</label><textarea placeholder="Dodatkowe informacje, wyjaśnienia..." value={detailedDescription} onChange={(e) => setDetailedDescription(e.target.value)} rows="2" className="w-full px-3 py-2 mt-1 text-white bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" /></div><div><label className="text-sm font-medium text-gray-300">Link do zrzutu ekranu (np. z Imgur)</label><input type="text" placeholder="https://i.imgur.com/..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required className="w-full px-3 py-2 mt-1 text-white bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" /></div><button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-500 transition-colors hover:shadow-[0_0_15px_rgba(139,92,246,0.7)]">Dodaj dowód</button></form></div>
    );
};

const AdminActions = ({ onApprove, onReject, canApprove, canReject }) => (
    <div className="mt-4 flex space-x-2">
        {canApprove && <button onClick={onApprove} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-500 transition-colors hover:shadow-[0_0_15px_rgba(34,197,94,0.7)]"><CheckIcon />Zatwierdź</button>}
        {canReject && <button onClick={onReject} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-500 transition-colors hover:shadow-[0_0_15px_rgba(239,68,68,0.7)]"><XIcon />Odrzuć</button>}
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

const ImageModal = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;
    return (<div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50" onClick={onClose}><img src={imageUrl} alt="Powiększony dowód" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl shadow-violet-500/30" /></div>);
};

const ThreadView = ({ user, contracts, onAddContract, onApproveContract, onRejectContract, currentUser, contractConfig, availableRoles, onImageClick }) => {
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, contractId: null });
  const [hoveredContract, setHoveredContract] = useState(null);

  if (!user) { return (<div className="flex-1 p-6 flex items-center justify-center text-gray-400">Wybierz wątek z listy po lewej stronie.</div>); }
  
  const currentUserRoleConfig = availableRoles.find(r => r.name === currentUser.role);
  const handleOpenRejectModal = (contractId) => { setRejectionModal({ isOpen: true, contractId }); };
  const handleConfirmRejection = (reason) => { onRejectContract(rejectionModal.contractId, reason); setRejectionModal({ isOpen: false, contractId: null }); };

  return (
    <>
      <RejectionModal isOpen={rejectionModal.isOpen} onClose={() => setRejectionModal({ isOpen: false, contractId: null })} onSubmit={handleConfirmRejection} />
      <div className="flex flex-col flex-1 bg-gray-800"><header className="px-6 py-4 bg-gray-800 border-b-2 border-violet-500/30"><h2 className="text-xl font-semibold text-white">Wątek: <span style={styles.purpleGlowText}>{user.nickname}</span></h2><p className="text-sm text-gray-400">Static ID: {user.staticid}</p></header><main className="flex-1 p-6 overflow-y-auto"><div className="space-y-6">{contracts.length === 0 ? (<p className="text-gray-400">Brak zgłoszonych kontraktów w tym wątku.</p>) : (contracts.map(contract => (<div key={contract.id} className="p-4 bg-gray-900/70 rounded-lg shadow-md border border-gray-700 transition-all duration-300" onMouseEnter={() => setHoveredContract(contract.id)} onMouseLeave={() => setHoveredContract(null)} style={hoveredContract === contract.id ? styles.purpleGlow : {}}><div className="flex items-start justify-between"><div><h3 className="text-lg font-semibold text-violet-300">{contract.contracttype}</h3>{contract.detaileddescription && (<p className="mt-1 text-sm text-gray-300">{contract.detaileddescription}</p>)}<p className="mt-2 mb-3 text-xs text-gray-500">{new Date(contract.timestamp).toLocaleString('pl-PL')}</p></div><div className="flex flex-col items-end space-y-2">{contract.isapproved && (<div className="flex-shrink-0 px-3 py-1 ml-4 text-sm font-bold text-green-800 bg-green-300 rounded-full">Zatwierdzony: ${contract.payoutamount.toLocaleString('pl-PL')}</div>)}{contract.isrejected && (<div className="flex-shrink-0 px-3 py-1 ml-4 text-sm font-bold text-red-800 bg-red-300 rounded-full">Odrzucony</div>)}</div></div><img src={contract.imageurl} alt={`Dowód dla: ${contract.contracttype}`} className="object-cover w-full mt-2 border border-gray-600 rounded-md max-w-lg cursor-pointer transition-transform hover:scale-105" onClick={() => onImageClick(contract.imageurl)} onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/800x400/1f2937/ffffff?text=Błąd+ładowania+obrazka"}} />{contract.isrejected && contract.rejectionreason && (<div className="mt-2 p-3 bg-red-900/50 rounded-md text-sm"><p className="font-semibold text-red-300">Powód odrzucenia:</p><p className="text-red-200">{contract.rejectionreason}</p></div>)}{currentUser.id !== user.id && !contract.isapproved && !contract.isrejected && (<AdminActions onApprove={() => onApproveContract(contract.id, contract.contracttype)} onReject={() => handleOpenRejectModal(contract.id)} canApprove={currentUserRoleConfig.canapprove} canReject={currentUserRoleConfig.canreject} />)}</div>)))}</div></main>{currentUserRoleConfig.isthreadvisible && user.id === currentUser.id && (<ContractForm onAddContract={onAddContract} contractConfig={contractConfig} />)}</div>
    </>
  );
};

export default function App() {
  const [appData, setAppData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [activeThreadUserId, setActiveThreadUserId] = useState(null);
  const [zoomedImageUrl, setZoomedImageUrl] = useState(null);
  const API_URL = '';

  const fetchData = useCallback(async () => {
    if (!token) { setIsLoading(false); return; }
    try {
      const response = await fetch(`${API_URL}/api/data`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.status === 401 || response.status === 403) { handleLogout(); return; }
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setAppData(data);
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userFromToken = data.users.find(u => u.id === decodedToken.id);
      setCurrentUser(userFromToken);
      if (!activeThreadUserId) { setActiveThreadUserId(userFromToken.id); }
    } catch (error) { console.error("Failed to fetch data:", error); handleLogout(); } finally { setIsLoading(false); }
  }, [token, activeThreadUserId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  
  const handleLogin = async (nickname, password) => {
    const response = await fetch(`${API_URL}/api/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nickname, password }) });
    if (!response.ok) throw new Error('Login failed');
    const { token: newToken } = await response.json();
    localStorage.setItem('token', newToken);
    setToken(newToken);
    return true;
  };

  const handleLogout = () => { localStorage.removeItem('token'); setToken(null); setCurrentUser(null); };

  const handleAddContract = async (newContractData) => { await fetch(`${API_URL}/api/contracts`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ userNickname: currentUser.nickname, ...newContractData }), }); fetchData(); };
  const handleApproveContract = async (contractId, contractType) => { const config = appData.contractConfig.find(c => c.name === contractType); const amount = config ? config.payout : 0; await fetch(`${API_URL}/api/contracts/${contractId}/approve`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ payoutAmount: amount }) }); fetchData(); };
  const handleRejectContract = async (contractId, reason) => { await fetch(`${API_URL}/api/contracts/${contractId}/reject`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ rejectionReason: reason }) }); fetchData(); };
  
  if (isLoading) { return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white" style={styles.purpleGlowText}>Ładowanie...</div>; }
  if (!currentUser || !appData) { return <LoginPage onLogin={handleLogin} />; }

  const { users, contracts, contractConfig, availableRoles, changelog } = appData;
  const activeUser = users.find(u => u.id === activeThreadUserId);
  const activeContracts = contracts.filter(c => c.userid === activeThreadUserId);

  return (
    <div className="flex h-screen font-sans bg-gray-800">
      <ImageModal imageUrl={zoomedImageUrl} onClose={() => setZoomedImageUrl(null)} />
      <Sidebar users={users} currentUser={currentUser} onSelectUser={setActiveThreadUserId} onLogout={handleLogout} activeThreadUserId={activeThreadUserId} availableRoles={availableRoles} changelog={changelog} />
      <ThreadView user={activeUser} contracts={activeContracts} onAddContract={handleAddContract} onApproveContract={handleApproveContract} onRejectContract={handleRejectContract} currentUser={currentUser} contractConfig={contractConfig} availableRoles={availableRoles} onImageClick={setZoomedImageUrl} />
    </div>
  );
}
