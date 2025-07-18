import React, { useState, useEffect, useCallback } from 'react';

// --- IKONY ---
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);

// --- KOMPONENTY APLIKACJI ---

const LoginPage = ({ onLogin }) => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onLogin(nickname, password);
    } catch (err) {
      setError('Nieprawidłowy nick lub hasło.');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800"><div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-lg"><div className="text-center"><h2 className="text-3xl font-bold text-white">System Kontraktów</h2><p className="mt-2 text-sm text-gray-400">Logowanie do panelu rodziny</p></div><form className="space-y-6" onSubmit={handleSubmit}><div><label htmlFor="nickname" className="text-sm font-medium text-gray-300">Nick z gry</label><input id="nickname" name="nickname" type="text" required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="np. Gregory Tyler" value={nickname} onChange={(e) => setNickname(e.target.value)} /></div><div><label htmlFor="password" className="text-sm font-medium text-gray-300">Hasło</label><input id="password" name="password" type="password" required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} /></div>{error && <p className="text-red-500 text-sm text-center">{error}</p>}<div><button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Zaloguj się</button></div></form></div></div>
  );
};

const Sidebar = ({ users, currentUser, onSelectUser, onLogout, activeThreadUserId, availableRoles }) => {
  const currentUserRoleConfig = availableRoles.find(r => r.name === currentUser.role);
  const canViewOtherThreads = currentUserRoleConfig?.canviewthreads || false;

  const usersToDisplay = canViewOtherThreads
    ? users.filter(u => {
        const userRoleConfig = availableRoles.find(r => r.name === u.role);
        return userRoleConfig?.isthreadvisible;
      })
    : [currentUser];

  return (
    <div className="flex flex-col w-64 h-screen bg-gray-800 text-white">
      <div className="px-4 py-3 text-xl font-bold border-b border-gray-700"><span className="text-indigo-400">Panel Rodziny</span></div>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          <p className="px-2 pb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">{canViewOtherThreads ? 'Wątki członków' : 'Mój wątek'}</p>
          {usersToDisplay.map(user => (
            <a key={user.id} href="#" onClick={(e) => { e.preventDefault(); onSelectUser(user.id); }} className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${user.id === activeThreadUserId ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
              {user.nickname}
            </a>
          ))}
        </nav>
      </div>
      <div className="p-2 border-t border-gray-700">
        <div className="p-3 text-sm bg-gray-900 rounded-md"><p className="font-semibold">{currentUser.nickname}</p><p className="text-xs text-gray-400 capitalize">Rola: {currentUser.role}</p></div>
        <button onClick={onLogout} className="w-full px-3 py-2 mt-2 text-sm font-medium text-left text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">Wyloguj</button>
      </div>
    </div>
  );
};

const ContractForm = ({ onAddContract, contractConfig }) => {
    const [contractType, setContractType] = useState(contractConfig.length > 0 ? contractConfig[0].name : '');
    const [detailedDescription, setDetailedDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const handleSubmit = (e) => { e.preventDefault(); if (contractType && imageFile) { onAddContract({ contractType, detailedDescription, imageFile }); setContractType(contractConfig[0].name); setDetailedDescription(''); setImageFile(null); e.target.reset(); } };
    return (
      <div className="p-4 bg-gray-700 border-t border-gray-600"><form onSubmit={handleSubmit} className="space-y-3"><div><label className="text-sm font-medium text-gray-300">Rodzaj kontraktu</label><select value={contractType} onChange={(e) => setContractType(e.target.value)} className="w-full px-3 py-2 mt-1 text-white bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">{contractConfig.map(config => (<option key={config.name} value={config.name}>{config.name}</option>))}</select></div><div><label className="text-sm font-medium text-gray-300">Dodatkowy opis (opcjonalnie)</label><textarea placeholder="Dodatkowe informacje, wyjaśnienia..." value={detailedDescription} onChange={(e) => setDetailedDescription(e.target.value)} rows="2" className="w-full px-3 py-2 mt-1 text-white bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" /></div><div><label className="text-sm font-medium text-gray-300">Dowód (zrzut ekranu)</label><input type="file" accept="image/*" required onChange={(e) => setImageFile(e.target.files[0])} className="w-full mt-1 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" /></div><button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Dodaj dowód</button></form></div>
    );
};

const AdminActions = ({ onApprove, onReject, canApprove, canReject }) => (
    <div className="mt-4 flex space-x-2">
        {canApprove && <button onClick={onApprove} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"><CheckIcon />Zatwierdź</button>}
        {canReject && <button onClick={onReject} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"><XIcon />Odrzuć</button>}
    </div>
);

const RejectionModal = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (reason.trim()) {
            onSubmit(reason);
            setReason('');
        } else {
            alert('Proszę podać powód odrzucenia.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-semibold text-white mb-4">Powód odrzucenia kontraktu</h3>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Wpisz powód..."
                    rows="4"
                    className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
                <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600">Anuluj</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Potwierdź odrzucenie</button>
                </div>
            </div>
        </div>
    );
};

const ThreadView = ({ user, contracts, onAddContract, onApproveContract, onRejectContract, currentUser, contractConfig, availableRoles }) => {
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, contractId: null });

  if (!user) { return (<div className="flex-1 p-6 flex items-center justify-center text-gray-400">Wybierz wątek z listy.</div>); }
  
  const currentUserRoleConfig = availableRoles.find(r => r.name === currentUser.role);
  
  const handleOpenRejectModal = (contractId) => {
      setRejectionModal({ isOpen: true, contractId });
  };

  const handleConfirmRejection = (reason) => {
      onRejectContract(rejectionModal.contractId, reason);
      setRejectionModal({ isOpen: false, contractId: null });
  };

  return (
    <>
      <RejectionModal 
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, contractId: null })}
        onSubmit={handleConfirmRejection}
      />
      <div className="flex flex-col flex-1 bg-gray-700"><header className="px-6 py-4 bg-gray-700 border-b border-gray-600"><h2 className="text-xl font-semibold text-white">Wątek: {user.nickname}</h2><p className="text-sm text-gray-400">Static ID: {user.staticid}</p></header><main className="flex-1 p-6 overflow-y-auto"><div className="space-y-6">{contracts.length === 0 ? (<p className="text-gray-400">Brak zgłoszonych kontraktów w tym wątku.</p>) : (contracts.map(contract => (<div key={contract.id} className="p-4 bg-gray-800 rounded-lg shadow-md"><div className="flex items-start justify-between"><div><h3 className="text-lg font-semibold text-white">{contract.contracttype}</h3>{contract.detaileddescription && (<p className="mt-1 text-sm text-gray-300">{contract.detaileddescription}</p>)}<p className="mt-2 mb-3 text-xs text-gray-500">{new Date(contract.timestamp).toLocaleString('pl-PL')}</p></div><div className="flex flex-col items-end space-y-2">{contract.isapproved && (<div className="flex-shrink-0 px-3 py-1 ml-4 text-sm font-bold text-green-800 bg-green-300 rounded-full">Zatwierdzony: ${contract.payoutamount.toLocaleString('pl-PL')}</div>)}{contract.isrejected && (<div className="flex-shrink-0 px-3 py-1 ml-4 text-sm font-bold text-red-800 bg-red-300 rounded-full">Odrzucony</div>)}</div></div><img src={contract.imageurl} alt={`Dowód dla: ${contract.contracttype}`} className="object-cover w-full mt-2 border border-gray-600 rounded-md max-w-lg" onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/800x400/1f2937/ffffff?text=Błąd+ładowania+obrazka"}} />{contract.isrejected && contract.rejectionreason && (<div className="mt-2 p-3 bg-red-900/50 rounded-md text-sm"><p className="font-semibold text-red-300">Powód odrzucenia:</p><p className="text-red-200">{contract.rejectionreason}</p></div>)}{currentUser.id !== user.id && !contract.isapproved && !contract.isrejected && (<AdminActions onApprove={() => onApproveContract(contract.id, contract.contracttype)} onReject={() => handleOpenRejectModal(contract.id)} canApprove={currentUserRoleConfig.canapprove} canReject={currentUserRoleConfig.canreject} />)}</div>)))}</div></main>{currentUserRoleConfig.canpost && user.id === currentUser.id && (<ContractForm onAddContract={onAddContract} contractConfig={contractConfig} />)}</div>
    </>
  );
};

export default function App() {
  const [appData, setAppData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [activeThreadUserId, setActiveThreadUserId] = useState(null);

  const API_URL = ''; // Na Render nie potrzebujemy tego, bo używamy rewrite rules

  const fetchData = useCallback(async () => {
    if (!token) {
        setIsLoading(false);
        return;
    }
    try {
      const response = await fetch(`${API_URL}/api/data`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setAppData(data);
      
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userFromToken = data.users.find(u => u.id === decodedToken.id);
      setCurrentUser(userFromToken);
      if (!activeThreadUserId) {
        setActiveThreadUserId(userFromToken.id);
      }

    } catch (error) {
      console.error("Failed to fetch data:", error);
      handleLogout();
    } finally {
        setIsLoading(false);
    }
  }, [token, activeThreadUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleLogin = async (nickname, password) => {
    const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, password })
    });
    if (!response.ok) throw new Error('Login failed');
    const { token: newToken } = await response.json();
    localStorage.setItem('token', newToken);
    setToken(newToken);
    return true;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  const handleAddContract = async (newContractData) => {
    const { contractType, detailedDescription } = newContractData;
    await fetch(`${API_URL}/api/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
            userNickname: currentUser.nickname,
            contractType, 
            detailedDescription, 
            imageUrl: 'https://placehold.co/800x400/1f2937/ffffff?text=Nowy+kontrakt' 
        }),
    });
    fetchData();
  };
  const handleApproveContract = async (contractId, contractType) => {
    const config = appData.contractConfig.find(c => c.name === contractType);
    const amount = config ? config.payout : 0;
    await fetch(`${API_URL}/api/contracts/${contractId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ payoutAmount: amount })
    });
    fetchData();
  };
  const handleRejectContract = async (contractId, reason) => {
    await fetch(`${API_URL}/api/contracts/${contractId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rejectionReason: reason })
    });
    fetchData();
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-800 text-white">Ładowanie...</div>;
  }
  
  if (!currentUser || !appData) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const { users, contracts, contractConfig, availableRoles } = appData;
  const activeUser = users.find(u => u.id === activeThreadUserId);
  const activeContracts = contracts.filter(c => c.userid === activeThreadUserId);

  return (
    <div className="flex h-screen font-sans">
      <Sidebar users={users} currentUser={currentUser} onSelectUser={setActiveThreadUserId} onLogout={handleLogout} activeThreadUserId={activeThreadUserId} availableRoles={availableRoles} />
      <ThreadView user={activeUser} contracts={activeContracts} onAddContract={handleAddContract} onApproveContract={handleApproveContract} onRejectContract={handleRejectContract} currentUser={currentUser} contractConfig={contractConfig} availableRoles={availableRoles} />
    </div>
  );
}

