import React, { useState, useEffect, useRef } from 'react';
import { AppLogo, SECTORS_SD, SECTORS_LC } from './constants';
import { User, UserRole, City, Poll, Post, Prize, Winner, PollOption, AppInstaller, VoteRecord } from './types';
import { db, sendVerificationEmail } from './services/storage';
import { INITIAL_USERS } from './constants';

// --- Icons (SVG Components) ---
const Icons = {
  Home: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  Poll: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Apps: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Prize: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>,
  Profile: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Admin: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Download: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
};

// --- Hero Banner ---
const HeroBanner = ({ image, title, subtitle, overlayColor = "from-logo-blue/90" }: { image: string, title: React.ReactNode, subtitle: string, overlayColor?: string }) => (
  <div className="relative h-48 md:h-64 rounded-[2.5rem] overflow-hidden shadow-xl mb-8">
    <img src={image} alt="Hero" className="w-full h-full object-cover" />
    <div className={`absolute inset-0 bg-gradient-to-r ${overlayColor} to-transparent`}></div>
    <div className="absolute bottom-0 left-0 p-8 md:p-10">
      <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 leading-none drop-shadow-md">
        {title}
      </h2>
      <p className="text-white/80 font-bold font-mono text-xs md:text-sm uppercase tracking-widest backdrop-blur-sm bg-white/10 inline-block px-3 py-1 rounded-full">
        {subtitle}
      </p>
    </div>
  </div>
);

// --- Navbar ---
const Navbar = ({ user, setView, currentView, onLogout }: any) => {
  const navItems = [
    { id: 'MURO', label: 'MURO' },
    { id: 'VOTAR', label: 'VOTAR' },
    { id: 'APPS', label: 'APPS' },
    { id: 'PREMIOS', label: 'PREMIOS' },
    { id: 'R33', label: 'LOS 33' },
    { id: 'CURSOS', label: 'CURSOS' },
  ];

  return (
    <nav className="glass-light sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center cursor-pointer group" onClick={() => setView('MURO')}>
             <div className="transform group-hover:scale-105 transition-transform duration-300 drop-shadow-sm">
               <AppLogo className="h-12 w-auto" />
             </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`font-bold text-xs px-5 py-2.5 rounded-full transition-all duration-300 tracking-wide ${
                  currentView === item.id 
                    ? 'bg-gradient-to-r from-logo-teal to-logo-blue text-white shadow-lg shadow-logo-teal/20' 
                    : 'text-gray-500 hover:text-logo-blue hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="ml-6 flex items-center space-x-3 pl-6 border-l-2 border-slate-100">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition group relative" onClick={() => setView('PROFILE')}>
                <div className="relative">
                  <div className={`absolute -inset-[2px] rounded-full blur-sm ${currentView === 'PROFILE' ? 'bg-logo-pink' : 'bg-transparent'} transition-all`}></div>
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}+${user.surname}&background=random`} alt="Profile" className={`h-10 w-10 rounded-full border-2 object-cover relative z-10 ${currentView === 'PROFILE' ? 'border-logo-pink' : 'border-white'} shadow-sm`}/>
                </div>
              </div>
              {(user.role === UserRole.MASTER || user.role === UserRole.ADMIN) && (
                <button onClick={() => setView('ADMIN')} className="px-3 py-1 rounded-full bg-slate-800 text-white hover:bg-logo-pink transition flex items-center gap-1 shadow-md">
                  <Icons.Admin />
                  <span className="text-[10px] font-black uppercase tracking-wider">Admin</span>
                </button>
              )}
               <button onClick={onLogout} className="text-gray-400 hover:text-logo-pink transition bg-slate-50 p-2 rounded-full"><Icons.Logout /></button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const BottomNav = ({ currentView, setView }: { currentView: string, setView: (v: string) => void }) => {
  const navItems = [
    { id: 'MURO', icon: <Icons.Home />, label: 'Muro' },
    { id: 'VOTAR', icon: <Icons.Poll />, label: 'Votar' },
    { id: 'APPS', icon: <Icons.Apps />, label: 'Apps' },
    { id: 'PREMIOS', icon: <Icons.Prize />, label: 'Premios' },
    { id: 'PROFILE', icon: <Icons.Profile />, label: 'Yo' },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
      <div className="bg-white/95 backdrop-blur-xl border border-white/50 rounded-2xl shadow-soft p-2 flex justify-between items-center relative">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setView(item.id)} className={`flex flex-col items-center justify-center w-full h-14 rounded-xl transition-all duration-300 relative group ${currentView === item.id ? 'text-logo-teal' : 'text-gray-400 hover:text-logo-blue'}`}>
            <div className={`transform transition-all duration-300 ${currentView === item.id ? 'scale-110 -translate-y-1' : ''}`}>{item.icon}</div>
            {currentView === item.id && <span className="absolute bottom-1 text-[9px] font-black uppercase tracking-widest text-logo-teal animate-fade-in">{item.label}</span>}
            {currentView === item.id && <div className="absolute bottom-0 w-1 h-1 bg-logo-teal rounded-full"></div>}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Apps Section ---
const Apps = ({ user }: { user: User }) => {
  const handleDownload = (app: any) => {
    // Add to history
    const currentUser = db.getUsers().find(u => u.id === user.id);
    if (currentUser && !currentUser.installationHistory.includes(app.name)) {
      currentUser.installationHistory.push(app.name);
      const allUsers = db.getUsers().map(u => u.id === currentUser.id ? currentUser : u);
      db.saveUsers(allUsers);
    }

    if (app.warningMessage) {
      if (window.confirm(`${app.warningTitle}\n\n${app.warningMessage}`)) {
        window.open(app.downloadUrl, '_blank');
      }
    } else {
      window.open(app.downloadUrl, '_blank');
    }
  };

  const apps = [
    {
      name: 'MEDIA CENTER',
      subtitle: 'MOVIES & TV',
      desc: 'XUPER V5.1',
      icon: '🎬',
      accent: 'border-l-4 border-indigo-500',
      iconBg: 'bg-indigo-50 text-indigo-500',
      downloadUrl: 'https://app.lat-servicio.app/app/XPRmob_DOWNTV.apk',
      warningTitle: 'ADVERTENCIA ⚠️',
      warningMessage: 'Al darle click en el siguiente enlace, saldrá un anuncio que dice que esta instalación es dañina, dale en DESCARGAR DE TODOS MODOS, esa advertencia es porque estas una app gratuita de uso libre. Para poder instalar debes PERMITIR LA INSTALACIÓN DE FUENTES DESCONOCIDAS.\n\nUna vez que ingresas regístrate con un correo personal. Recuerda en la medida de las posibilidades utilizar correos secundarios para evitar spam y saturación en tu correo.'
    },
    {
      name: 'AUDIO STREAM',
      subtitle: 'SIN ANUNCIOS',
      desc: 'Spotify Mod',
      icon: '🎧',
      accent: 'border-l-4 border-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-500',
      downloadUrl: 'https://transfer.it/t/wz9bbQ9VwRbD',
      warningTitle: 'ADVERTENCIA ⚠️',
      warningMessage: 'No utilices la misma contraseña que utilizas para tu correo para que no pongas en peligro tus cuentas, utiliza contraseña diferente.\n\nINSTRUCCIONES PARA INSTALAR:\nAntes de instalar, desinstala la app oficial de Spotify.\nAl ingresar regístrate como nuevo usuario con CORREO ELECTRÓNICO, no se requiere verificación.'
    },
    {
      name: 'GAMING HUB',
      subtitle: 'VIP ACCESS',
      desc: 'Acceder',
      icon: '🎮',
      accent: 'border-l-4 border-logo-pink',
      iconBg: 'bg-pink-50 text-logo-pink',
      downloadUrl: '#',
      warningTitle: '',
      warningMessage: ''
    },
    {
      name: 'TUTORIALES',
      subtitle: 'APRENDE',
      desc: 'Ver Guía',
      icon: '📚',
      accent: 'border-l-4 border-logo-yellow',
      iconBg: 'bg-yellow-50 text-yellow-600',
      downloadUrl: '#',
      warningTitle: '',
      warningMessage: ''
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-24">
      <HeroBanner 
        image="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
        title={<>Apps <span className="text-logo-teal">Gratuitas</span></>}
        subtitle="Selección Premium"
        overlayColor="from-logo-blue/90"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {apps.map((app, idx) => (
          <div key={idx} className={`bg-white rounded-2xl shadow-soft hover:shadow-lg transition-all relative overflow-hidden group hover:-translate-y-1 ${app.accent}`}>
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${app.iconBg}`}>{app.icon}</div>
                <div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">{app.subtitle}</span>
                  <h3 className="text-xl font-black text-slate-800 leading-none mb-1">{app.name}</h3>
                  <p className="text-xs font-bold text-slate-500 line-clamp-2">{app.desc}</p>
                </div>
              </div>
              <button onClick={() => handleDownload(app)} className={`w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center transition group-hover:bg-logo-blue group-hover:border-logo-blue group-hover:text-white text-slate-400`}><Icons.Download /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Polls Section ---
const Polls = ({ user }: { user: User }) => {
  const [polls, setPolls] = useState<Poll[]>(db.getPolls());
  const [activeTab, setActiveTab] = useState('Alcalde');

  const handleVote = (pollId: string, optionId: string) => {
    const currentUser = db.getUsers().find(u => u.id === user.id);
    if (!currentUser || currentUser.pollHistory.includes(pollId)) {
      alert("¡Ya registraste tu voto en esta encuesta!");
      return;
    }

    const updatedPolls = polls.map(p => {
      if (p.id === pollId) {
        // Add Record for Statistics
        const newRecord: VoteRecord = {
          optionId,
          age: currentUser.age,
          sector: currentUser.sector,
          timestamp: Date.now()
        };
        const currentRecords = p.voteRecords || [];

        return {
          ...p,
          options: p.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o),
          voteRecords: [...currentRecords, newRecord]
        };
      }
      return p;
    });
    setPolls(updatedPolls);
    db.savePolls(updatedPolls);

    let newTicket = Math.floor(Math.random() * 50000) + 1;
    while (currentUser.tickets.includes(newTicket)) {
      newTicket = Math.floor(Math.random() * 50000) + 1;
    }

    currentUser.tickets.push(newTicket);
    currentUser.pollHistory.push(pollId);
    db.saveUsers(db.getUsers().map(u => u.id === currentUser.id ? currentUser : u));
    
    alert(`✅ ¡VOTO EXITOSO! GANASTE EL TICKET: #${newTicket}`);
  };

  const filteredPolls = polls.filter(p => p.category === activeTab && p.active);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in pb-24">
      <HeroBanner 
        image="https://images.unsplash.com/photo-1540910419868-475647c7a165?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
        title={<>Tu Voz <span className="text-logo-teal">Cuenta</span></>}
        subtitle="Participación Ciudadana"
        overlayColor="from-logo-blue/80"
      />

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest hidden md:block">Categorías</h3>
        <div className="bg-white p-1 rounded-full shadow-sm border border-slate-100 flex gap-1 overflow-x-auto w-full md:w-auto">
          {['Alcalde', 'Prefecto', 'Obras', 'Nacional'].map(cat => (
            <button key={cat} onClick={() => setActiveTab(cat)} className={`px-5 py-2 rounded-full font-bold text-xs transition-all uppercase tracking-wide whitespace-nowrap ${activeTab === cat ? 'bg-logo-teal text-white shadow-md' : 'text-gray-400 hover:bg-slate-50'}`}>{cat}</button>
          ))}
        </div>
      </div>

      {filteredPolls.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] shadow-soft"><p className="text-slate-300 font-bold text-lg">No hay encuestas disponibles</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolls.map(poll => {
            const hasVoted = user.pollHistory.includes(poll.id);
            const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);

            return (
              <div key={poll.id} className="bg-white rounded-[2rem] shadow-soft p-8 relative overflow-hidden border border-slate-50 group hover:shadow-lg transition">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-logo-blue to-logo-teal"></div>
                <h3 className="font-black text-2xl mb-6 text-logo-blue leading-tight">{poll.title}</h3>
                <div className="space-y-3">
                  {poll.options.map(opt => {
                    const percent = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                    return (
                      <div key={opt.id} onClick={() => !hasVoted && handleVote(poll.id, opt.id)} className={`relative border rounded-xl p-2 cursor-pointer transition-all ${hasVoted ? 'border-transparent bg-slate-50' : 'border-slate-100 hover:border-logo-teal hover:bg-teal-50/30'}`}>
                        {hasVoted && <div className="absolute top-0 left-0 h-full bg-logo-teal/10 rounded-xl z-0 transition-all duration-1000" style={{ width: `${percent}%` }}></div>}
                        <div className="flex items-center gap-4 relative z-10 p-1">
                          {opt.imageUrl ? <img src={opt.imageUrl} className="w-12 h-12 rounded-lg object-cover bg-slate-100 shadow-sm" alt="Option" /> : <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-lg">🗳️</div>}
                          <div className="flex-1">
                            <div className="font-bold text-slate-700 text-sm uppercase">{opt.text}</div>
                            {hasVoted && <div className="flex justify-between items-center mt-1"><div className="h-2 flex-1 bg-slate-200 mr-3 rounded-full overflow-hidden"><div className="h-full bg-logo-teal" style={{ width: `${percent}%` }}></div></div><span className="text-xs font-black text-logo-blue">{percent}%</span></div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {hasVoted && <div className="mt-6 text-center"><span className="text-[10px] font-black text-white bg-green-500 px-4 py-2 rounded-full shadow-lg shadow-green-200 uppercase tracking-widest">Voto Registrado</span></div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- Admin Panel ---
const AdminPanel = ({ user }: { user: User }) => {
  const [tab, setTab] = useState<'users' | 'polls' | 'prizes' | 'raffle'>('users');
  const [users, setUsers] = useState(db.getUsers());
  const [polls, setPolls] = useState(db.getPolls());
  const [prizes, setPrizes] = useState(db.getPrizes());
  
  // Stats Modal
  const [statsPoll, setStatsPoll] = useState<Poll | null>(null);

  // Forms State
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollCat, setNewPollCat] = useState('Alcalde');
  const [newPollOptions, setNewPollOptions] = useState([{ text: '', imageUrl: '' }, { text: '', imageUrl: '' }]);
  const [newPrizeTitle, setNewPrizeTitle] = useState('');
  const [newPrizeDesc, setNewPrizeDesc] = useState('');
  const [newPrizeImg, setNewPrizeImg] = useState('');
  const [raffleResult, setRaffleResult] = useState<any>(null);

  const handleImageUpload = (e: any, callback: (url: string) => void) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const downloadDB = () => {
    if (user.role !== UserRole.MASTER) return;
    const data = db.getUsers();
    const csvContent = "data:text/csv;charset=utf-8,ID,Nombre,Apellido,Email,Rol,Ciudad,Sector,Edad\n" + data.map(u => `${u.id},${u.name},${u.surname},${u.email},${u.role},${u.city},${u.sector},${u.age}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "base_datos_reto33.csv");
    document.body.appendChild(link);
    link.click();
  };

  const changeRole = (targetId: string, newRole: UserRole) => {
    if (user.role !== UserRole.MASTER && newRole === UserRole.ADMIN) return;
    const updated = users.map(u => u.id === targetId ? { ...u, role: newRole } : u);
    setUsers(updated);
    db.saveUsers(updated);
  };

  const createPoll = () => {
    if (!newPollTitle) return;
    const newPoll: Poll = {
      id: crypto.randomUUID(),
      title: newPollTitle,
      category: newPollCat as any,
      active: true,
      options: newPollOptions.map(o => ({ id: crypto.randomUUID(), text: o.text || 'Opción', imageUrl: o.imageUrl, votes: 0 })),
      voteRecords: []
    };
    const updated = [...polls, newPoll];
    setPolls(updated);
    db.savePolls(updated);
    setNewPollTitle('');
    setNewPollOptions([{ text: '', imageUrl: '' }, { text: '', imageUrl: '' }]);
    alert('Encuesta creada');
  };

  const createPrize = () => {
    if (!newPrizeTitle) return;
    const newPrize: Prize = { id: crypto.randomUUID(), title: newPrizeTitle, description: newPrizeDesc, imageUrl: newPrizeImg || 'https://via.placeholder.com/300', active: true };
    const updated = [...prizes, newPrize];
    setPrizes(updated);
    db.savePrizes(updated);
    setNewPrizeTitle(''); setNewPrizeDesc(''); setNewPrizeImg('');
  };

  const resetRaffle = () => {
    if (!window.confirm("ADVERTENCIA ⚠️\n¿Estás seguro de REINICIAR el sorteo?\nEsto borrará todos los tickets de los usuarios.")) return;
    const updatedUsers = users.map(u => ({ ...u, tickets: [], pollHistory: [] }));
    setUsers(updatedUsers);
    db.saveUsers(updatedUsers);
    alert('Sorteo Reiniciado con Éxito');
  };

  const executeRaffle = () => {
    const allTickets: { ticket: number, userId: string }[] = [];
    users.forEach(u => { if (u.role !== UserRole.R33) u.tickets.forEach(t => allTickets.push({ ticket: t, userId: u.id })); });
    if (allTickets.length < 11) { alert("No hay suficientes tickets para generar 10 anulados y 1 ganador."); return; }
    const shuffled = allTickets.sort(() => 0.5 - Math.random());
    const annulled = shuffled.slice(0, 10);
    const winner = shuffled[10];
    const winnerUser = users.find(u => u.id === winner.userId);
    
    if (winnerUser) {
      const activePrize = prizes.find(p => p.active);
      const newWinner: Winner = { id: crypto.randomUUID(), userId: winnerUser.id, prizeId: activePrize ? activePrize.id : 'unknown', prizeTitle: activePrize ? activePrize.title : 'Premio Sorpresa', date: new Date().toISOString(), userName: `${winnerUser.name} ${winnerUser.surname}`, ticketNumber: winner.ticket };
      db.saveWinners([newWinner, ...db.getWinners()]);
      const newPost: Post = { id: crypto.randomUUID(), userId: user.id, content: `🎉 ¡TENEMOS GANADOR! 🎉\nEl ticket ganador es #${winner.ticket} perteneciente a ${winnerUser.name} ${winnerUser.surname}.\n\nTickets Anulados: ${annulled.map(a => '#' + a.ticket).join(', ')}.`, likes: [], shares: 0, comments: [], timestamp: Date.now() };
      db.savePosts([newPost, ...db.getPosts()]);
    }
    setRaffleResult({ winner, annulled });
  };

  // Logic to calculate Stats
  const calculateStats = (poll: Poll) => {
    if (!poll.voteRecords) return { ageGroups: {}, sectors: {} };
    const ageGroups: Record<string, number> = { '16-25': 0, '26-35': 0, '36-50': 0, '50+': 0 };
    const sectors: Record<string, number> = {};

    poll.voteRecords.forEach(v => {
      // Age
      if (v.age <= 25) ageGroups['16-25']++;
      else if (v.age <= 35) ageGroups['26-35']++;
      else if (v.age <= 50) ageGroups['36-50']++;
      else ageGroups['50+']++;
      
      // Sector
      sectors[v.sector] = (sectors[v.sector] || 0) + 1;
    });

    return { ageGroups, sectors };
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in pb-24">
      <div className="bg-white rounded-[2.5rem] shadow-soft min-h-screen border border-slate-100 overflow-hidden relative">
        <div className="bg-slate-900 p-8 text-white">
          <h2 className="text-3xl font-black uppercase tracking-widest mb-1">Panel de Mando</h2>
          <p className="text-slate-400 text-xs font-mono">ADMINISTRACIÓN CENTRALIZADA</p>
        </div>

        <div className="flex border-b border-slate-100 overflow-x-auto">
          {['users', 'polls', 'prizes', 'raffle'].map(t => (
            <button key={t} onClick={() => setTab(t as any)} className={`flex-1 py-4 px-6 font-black uppercase text-xs tracking-widest whitespace-nowrap hover:bg-slate-50 transition ${tab === t ? 'text-logo-teal border-b-4 border-logo-teal bg-slate-50' : 'text-slate-400'}`}>
              {t === 'users' ? 'Usuarios' : t === 'polls' ? 'Encuestas' : t === 'prizes' ? 'Premios' : 'Sorteo'}
            </button>
          ))}
        </div>

        <div className="p-8">
          {tab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-logo-blue uppercase">Base de Datos</h3>
                {user.role === UserRole.MASTER && <button onClick={downloadDB} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-green-600 transition shadow-lg">Descargar CSV</button>}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead><tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100"><th className="p-3">Usuario</th><th className="p-3">Rol</th><th className="p-3">Ciudad/Sector</th><th className="p-3">Acciones</th></tr></thead>
                  <tbody className="text-sm">
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-700">{u.name} {u.surname} <br/><span className="text-xs font-normal text-slate-400">{u.email}</span></td>
                        <td className="p-3"><span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${u.role === 'R33' ? 'bg-logo-gold text-white' : 'bg-slate-200 text-slate-500'}`}>{u.role}</span></td>
                        <td className="p-3 text-xs">{u.city}</td>
                        <td className="p-3 flex gap-2"><button onClick={() => changeRole(u.id, UserRole.R33)} className="text-[10px] bg-logo-blue text-white px-2 py-1 rounded hover:bg-logo-teal">Hacer R33</button>{user.role === UserRole.MASTER && <button onClick={() => changeRole(u.id, UserRole.ADMIN)} className="text-[10px] bg-slate-800 text-white px-2 py-1 rounded hover:bg-slate-900">Hacer Admin</button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'polls' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-black text-logo-blue uppercase mb-6">Crear Encuesta</h3>
                <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <input className="w-full p-3 rounded-xl border border-slate-200 text-sm" placeholder="Título" value={newPollTitle} onChange={e => setNewPollTitle(e.target.value)} />
                  <select className="w-full p-3 rounded-xl border border-slate-200 text-sm" value={newPollCat} onChange={e => setNewPollCat(e.target.value)}><option value="Alcalde">Alcalde</option><option value="Prefecto">Prefecto</option><option value="Obras">Obras</option><option value="Nacional">Nacional</option></select>
                  <div className="space-y-2"><p className="text-xs font-bold text-slate-400 uppercase">Opciones (Candidatos)</p>{newPollOptions.map((opt, idx) => (<div key={idx} className="flex gap-2 items-center"><input className="flex-1 p-2 rounded-lg border border-slate-200 text-xs" placeholder={`Opción ${idx + 1}`} value={opt.text} onChange={e => { const newOpts = [...newPollOptions]; newOpts[idx].text = e.target.value; setNewPollOptions(newOpts); }} /><label className="bg-slate-200 p-2 rounded-lg cursor-pointer hover:bg-slate-300">📷<input type="file" className="hidden" onChange={(e) => handleImageUpload(e, (url) => { const newOpts = [...newPollOptions]; newOpts[idx].imageUrl = url; setNewPollOptions(newOpts); })} /></label></div>))}<button onClick={() => setNewPollOptions([...newPollOptions, { text: '', imageUrl: '' }])} className="text-xs text-logo-teal font-bold hover:underline">+ Agregar Opción</button></div>
                  <button onClick={createPoll} className="w-full bg-logo-blue text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-logo-teal transition">Publicar Encuesta</button>
                </div>
              </div>
              <div>
                 <h3 className="text-xl font-black text-logo-blue uppercase mb-6">Encuestas Activas</h3>
                 <div className="space-y-4">
                   {polls.map(p => (
                     <div key={p.id} className="bg-white border border-slate-100 shadow-sm p-4 rounded-xl">
                       <div className="flex justify-between items-center mb-2">
                         <div><div className="font-bold text-slate-800">{p.title}</div><div className="text-xs text-slate-400 uppercase">{p.category}</div></div>
                         <button onClick={() => { const updated = polls.filter(x => x.id !== p.id); setPolls(updated); db.savePolls(updated); }} className="text-red-400 hover:text-red-600 font-bold text-xs">Eliminar</button>
                       </div>
                       <button onClick={() => setStatsPoll(p)} className="w-full bg-slate-100 text-slate-600 py-2 rounded-lg font-bold text-xs uppercase tracking-wide hover:bg-slate-200">📊 Ver Estadísticas</button>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          )}

          {tab === 'prizes' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-black text-logo-blue uppercase mb-6">Nuevo Premio</h3>
                <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <input className="w-full p-3 rounded-xl border border-slate-200 text-sm" placeholder="Título" value={newPrizeTitle} onChange={e => setNewPrizeTitle(e.target.value)} />
                  <textarea className="w-full p-3 rounded-xl border border-slate-200 text-sm" placeholder="Descripción" value={newPrizeDesc} onChange={e => setNewPrizeDesc(e.target.value)} />
                  <label className="block w-full p-3 rounded-xl border border-dashed border-slate-300 text-center cursor-pointer hover:bg-slate-100"><span className="text-xs font-bold text-slate-400">{newPrizeImg ? 'Imagen Cargada' : 'Subir Imagen del Premio'}</span><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, setNewPrizeImg)} /></label>
                  <button onClick={createPrize} className="w-full bg-logo-pink text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-pink-600 transition">Agregar Premio</button>
                </div>
              </div>
               <div>
                 <h3 className="text-xl font-black text-logo-blue uppercase mb-6">Premios en Lista</h3>
                 <div className="grid grid-cols-2 gap-4">
                   {prizes.map(p => (
                     <div key={p.id} className="bg-white border border-slate-100 shadow-sm p-3 rounded-xl relative group">
                       <img src={p.imageUrl} className="w-full h-24 object-cover rounded-lg mb-2" alt="prize" />
                       <div className="font-bold text-xs">{p.title}</div>
                       <button onClick={() => { const updated = prizes.filter(x => x.id !== p.id); setPrizes(updated); db.savePrizes(updated); }} className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow hover:bg-red-600">×</button>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          )}

          {tab === 'raffle' && (
            <div className="text-center max-w-lg mx-auto">
              <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem] mb-8">
                <h3 className="text-red-500 font-black uppercase text-xl mb-2">Zona de Peligro</h3>
                <p className="text-red-400 text-sm mb-6">Esta acción eliminará todos los tickets generados esta semana.</p>
                <button onClick={resetRaffle} className="bg-red-500 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-200 transition">Reiniciar Sorteo Semanal</button>
              </div>
              <div className="bg-gradient-to-br from-logo-blue to-logo-teal p-10 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-8 relative z-10">Realizar Sorteo</h3>
                <button onClick={executeRaffle} className="bg-white text-logo-blue px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition shadow-2xl relative z-10">Girar Tómbola</button>
                {raffleResult && (
                  <div className="mt-8 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 animate-fade-in text-left">
                    <div className="text-center mb-4"><div className="text-xs font-mono uppercase text-logo-yellow mb-1">Ticket Ganador</div><div className="text-5xl font-black text-white">#{raffleResult.winner.ticket}</div></div>
                    <div className="text-xs font-mono text-white/70"><strong>Anulados:</strong> {raffleResult.annulled.map((a: any) => '#' + a.ticket).join(', ')}</div>
                    <div className="mt-4 text-center text-sm font-bold bg-white text-logo-blue py-2 rounded-lg">¡Publicado en el Muro!</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stats Modal */}
        {statsPoll && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl animate-slide-up">
              <h3 className="text-2xl font-black text-logo-blue uppercase mb-6">Estadísticas: {statsPoll.title}</h3>
              {(() => {
                const stats = calculateStats(statsPoll);
                return (
                   <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                     <div>
                       <h4 className="font-bold text-slate-400 uppercase text-xs mb-3">Por Edad</h4>
                       {Object.entries(stats.ageGroups).map(([range, count]) => (
                         <div key={range} className="flex justify-between items-center mb-2 p-3 bg-slate-50 rounded-xl">
                           <span className="font-mono text-sm font-bold text-slate-600">{range} años</span>
                           <span className="bg-logo-teal text-white px-3 py-1 rounded-full text-xs font-black">{count} votos</span>
                         </div>
                       ))}
                     </div>
                     <div>
                       <h4 className="font-bold text-slate-400 uppercase text-xs mb-3">Por Sector (Top 5)</h4>
                       {Object.entries(stats.sectors).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([sec, count]) => (
                         <div key={sec} className="flex justify-between items-center mb-2 p-3 bg-slate-50 rounded-xl">
                           <span className="font-mono text-sm font-bold text-slate-600">{sec}</span>
                           <span className="bg-logo-pink text-white px-3 py-1 rounded-full text-xs font-black">{count} votos</span>
                         </div>
                       ))}
                     </div>
                   </div>
                );
              })()}
              <button onClick={() => setStatsPoll(null)} className="w-full mt-6 bg-slate-200 text-slate-600 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-slate-300">Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Profile Section ---
const Profile = ({ user, onUpdate, onLogout, setView }: { user: User, onUpdate: (u: User) => void, onLogout: () => void, setView: (v: string) => void }) => {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in pb-24">
      <div className="bg-white rounded-[3rem] shadow-soft overflow-hidden border border-slate-100 relative group">
        <div className="h-48 bg-gradient-to-r from-logo-blue to-logo-teal relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="px-10 pb-12">
          <div className="relative -mt-24 mb-6 flex flex-col md:flex-row justify-between items-end gap-4">
             <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}+${user.surname}&background=random`} className="w-40 h-40 rounded-full border-[8px] border-white bg-white shadow-xl relative z-10" alt="profile" />
             <div className="mb-2"><span className="bg-slate-100 text-slate-600 text-xs font-black px-5 py-2.5 rounded-full uppercase tracking-widest">{user.role}</span></div>
          </div>

          <h1 className="text-5xl font-black text-logo-blue uppercase tracking-tighter mb-2 leading-none">{user.name} <br/><span className="text-logo-teal">{user.surname}</span></h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-10">{user.city} — {user.sector}</p>
          
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-center"><div className="text-xs text-slate-400 font-black uppercase tracking-widest mb-2">TICKETS</div><div className="text-4xl font-black text-logo-blue">{user.tickets.length}</div></div>
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-center"><div className="text-xs text-slate-400 font-black uppercase tracking-widest mb-2">APPS</div><div className="text-4xl font-black text-logo-teal">{user.installationHistory.length}</div></div>
          </div>
          
          {user.tickets.length > 0 && (
             <div className="mb-12">
               <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4">Mis Números de la Suerte</h3>
               <div className="flex flex-wrap gap-3">{user.tickets.map(t => (<span key={t} className="bg-white text-logo-blue px-5 py-2 rounded-xl font-mono text-lg font-bold border border-slate-200 shadow-sm">#{t}</span>))}</div>
             </div>
          )}

          <div className="flex flex-col gap-4">
            {(user.role === UserRole.MASTER || user.role === UserRole.ADMIN) && (
              <button onClick={() => setView('ADMIN')} className="w-full py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:shadow-xl transition flex justify-center items-center gap-2">
                <Icons.Admin /> ACCEDER AL PANEL DE ADMINISTRADOR
              </button>
            )}
            <button className="w-full py-5 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-logo-blue hover:text-white transition shadow-sm">Configuración de Cuenta</button>
            <button onClick={onLogout} className="w-full py-4 border-2 border-red-100 text-red-400 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-500 transition">Cerrar Sesión</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Profile Section (Updated props usage in main app)
// --- Auth Component (No changes needed, logic already robust) ---
const Auth = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<any>({
    email: '', password: '', name: '', surname: '', age: '', phone: '', city: City.SANTO_DOMINGO, sector: ''
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (db.getUsers().some(u => u.email === formData.email)) {
      setError('El correo ya está registrado.');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);
    await sendVerificationEmail(formData.email, code);
    setStep(2);
    alert(`Código de simulación: ${code}`);
  };

  const verifyAndCreate = () => {
    if (verificationCode !== sentCode) {
      setError('Código incorrecto');
      return;
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      ...formData,
      age: parseInt(formData.age),
      role: UserRole.USER,
      tickets: [],
      installationHistory: [],
      pollHistory: [],
      friends: [],
      following: []
    };
    const users = db.getUsers();
    users.push(newUser);
    db.saveUsers(users);
    onLogin(newUser);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // MASTER OVERRIDE
    if (formData.email === 'gtplayec@gmail.com' && formData.password === 'RETO2026@') {
       const users = db.getUsers();
       let masterUser = users.find(u => u.email === 'gtplayec@gmail.com');
       
       if (masterUser) {
         masterUser.role = UserRole.MASTER;
         const updatedUsers = users.map(u => u.email === 'gtplayec@gmail.com' ? masterUser : u);
         db.saveUsers(updatedUsers);
         onLogin(masterUser);
       } else {
         const newMaster: User = { ...INITIAL_USERS[0], id: 'master-forced', role: UserRole.MASTER };
         users.push(newMaster);
         db.saveUsers(users);
         onLogin(newMaster);
       }
       return;
    }

    const users = db.getUsers();
    const user = users.find(u => u.email === formData.email && u.password === formData.password);
    if (user) onLogin(user); else setError('Credenciales inválidas');
  };

  const sectors = formData.city === City.SANTO_DOMINGO ? SECTORS_SD : SECTORS_LC;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-logo-teal/10 to-transparent rounded-full blur-[100px]"></div>
       <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-t from-logo-pink/10 to-transparent rounded-full blur-[100px]"></div>
      <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-soft w-full max-w-md animate-slide-up relative border border-white">
        <div className="flex justify-center mb-8"><div className="relative transform hover:scale-105 transition duration-500"><div className="absolute inset-0 bg-logo-teal/20 blur-xl rounded-full"></div><AppLogo className="h-20 w-auto relative z-10" /></div></div>
        <h2 className="text-3xl font-black text-center text-logo-blue mb-2 tracking-tight">{isLogin ? 'BIENVENIDO' : 'ÚNETE AHORA'}</h2>
        <p className="text-center text-slate-400 mb-8 font-medium text-sm">Tu voz, tu ciudad, tu premio.</p>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-2xl mb-6 text-center text-xs font-bold border border-red-100 animate-pulse">{error}</div>}
        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Correo Electrónico" className="w-full p-4 bg-slate-50 border border-slate-100 focus:border-logo-teal focus:ring-2 focus:ring-logo-teal/10 rounded-2xl outline-none text-slate-700 placeholder-slate-400 transition font-medium" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            <input type="password" placeholder="Contraseña" className="w-full p-4 bg-slate-50 border border-slate-100 focus:border-logo-teal focus:ring-2 focus:ring-logo-teal/10 rounded-2xl outline-none text-slate-700 placeholder-slate-400 transition font-medium" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            <button type="submit" className="w-full bg-gradient-to-r from-logo-blue to-logo-teal text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all mt-4">Iniciar Sesión</button>
          </form>
        ) : (
          step === 1 ? (
            <form onSubmit={handleRegister} className="space-y-3">
               <div className="grid grid-cols-2 gap-3"><input type="text" placeholder="Nombre" className="p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-700 text-sm focus:border-logo-teal" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /><input type="text" placeholder="Apellido" className="p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-700 text-sm focus:border-logo-teal" value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} required /></div>
               <input type="email" placeholder="Email" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-700 text-sm focus:border-logo-teal" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /><input type="password" placeholder="Contraseña" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-700 text-sm focus:border-logo-teal" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
               <select className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-700 text-sm focus:border-logo-teal" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value, sector: ''})}><option value={City.SANTO_DOMINGO}>Santo Domingo</option><option value={City.LA_CONCORDIA}>La Concordia</option></select>
                <select className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-700 text-sm focus:border-logo-teal" value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})} required><option value="" className="text-gray-400">Selecciona Sector</option>{sectors.map(s => <option key={s} value={s}>{s}</option>)}</select>
                <div className="grid grid-cols-2 gap-3"><input type="number" placeholder="Edad" className="p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-700 text-sm focus:border-logo-teal" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} required /><input type="tel" placeholder="Teléfono" className="p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-700 text-sm focus:border-logo-teal" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required /></div>
               <button type="submit" className="w-full bg-logo-pink text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-pink-600 transition shadow-lg mt-4">Continuar</button>
            </form>
          ) : (
             <div className="space-y-6">
               <input type="text" placeholder="000000" className="w-full p-5 bg-slate-50 border-2 border-logo-teal rounded-2xl text-center text-4xl font-mono text-logo-teal outline-none tracking-[0.5em]" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} />
               <button onClick={verifyAndCreate} className="w-full bg-gradient-to-r from-logo-teal to-logo-blue text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl">Verificar</button>
             </div>
          )
        )}
        <div className="mt-8 text-center"><button onClick={() => { setIsLogin(!isLogin); setStep(1); setError(''); }} className="text-logo-teal hover:text-logo-blue font-bold text-xs uppercase tracking-widest transition">{isLogin ? 'Crear una cuenta' : 'Volver al inicio'}</button></div>
      </div>
    </div>
  );
};

// --- The 33, Prizes, Wall are imported/reused from previous code block, ensured included in full App ---
const The33 = () => {
  const users = db.getUsers().filter(u => u.role === UserRole.R33);
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in pb-24">
      <HeroBanner image="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" title={<>LOS <span className="text-logo-gold">33</span></>} subtitle="Liderazgo & Excelencia" overlayColor="from-slate-900/90" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {users.map((u, idx) => (
          <div key={u.id} className="relative bg-white border border-slate-100 rounded-3xl p-8 flex flex-col items-center hover:border-logo-gold transition duration-300 hover:shadow-xl group hover:-translate-y-2">
            <div className="absolute -top-3 right-8 bg-gradient-to-r from-logo-yellow to-logo-gold text-slate-900 text-xs font-black px-3 py-1 rounded-full shadow-lg border-2 border-white">#{idx + 1}</div>
            <div className="relative mb-6 mt-2"><div className="absolute inset-0 bg-gradient-to-br from-logo-gold to-logo-yellow blur-xl rounded-full opacity-0 group-hover:opacity-40 transition duration-500"></div><img src={u.avatar} alt={u.name} className="w-28 h-28 rounded-full object-cover border-[6px] border-white shadow-lg transition duration-500" /></div>
            <h3 className="font-black text-xl text-logo-blue uppercase text-center leading-none mb-1">{u.name} <br/> <span className="text-slate-400">{u.surname}</span></h3>
            <span className="text-[10px] font-bold text-logo-teal bg-logo-teal/10 px-3 py-1 rounded-full mt-2 uppercase tracking-wide">{u.city}</span>
            {u.pdfUrl && <a href={u.pdfUrl} target="_blank" rel="noreferrer" className="mt-6 w-full bg-slate-50 hover:bg-logo-blue hover:text-white text-slate-600 py-3 rounded-xl text-center font-bold text-xs uppercase tracking-wide transition border border-slate-100">Ver Hoja de Vida</a>}
          </div>
        ))}
      </div>
    </div>
  );
};

const Prizes = () => {
  const [prizes] = useState<Prize[]>(db.getPrizes());
  const winners = db.getWinners();
  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-24">
      <HeroBanner image="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" title={<>Premios <span className="text-logo-pink">Semanales</span></>} subtitle="Gana Recompensas Exclusivas" overlayColor="from-logo-blue/90" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {prizes.filter(p => p.active).map(prize => (
           <div key={prize.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-soft hover:shadow-2xl transition-all duration-300 relative group transform hover:-translate-y-2">
             <div className="h-64 overflow-hidden relative"><img src={prize.imageUrl} alt={prize.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" /><div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-logo-pink text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Disponible</div></div>
             <div className="p-8"><h3 className="text-logo-blue font-black text-2xl uppercase leading-none mb-2">{prize.title}</h3><p className="text-sm text-slate-500 font-medium leading-relaxed">{prize.description}</p></div>
           </div>
        ))}
      </div>
      <div className="bg-white rounded-[3rem] p-12 shadow-xl border border-slate-100 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-logo-pink/5 rounded-full blur-[80px]"></div><div className="absolute -left-20 -bottom-20 w-96 h-96 bg-logo-teal/5 rounded-full blur-[80px]"></div>
        <h3 className="text-3xl font-black text-logo-blue mb-10 flex items-center gap-3 uppercase tracking-tighter relative z-10"><span className="text-logo-gold text-4xl">🏆</span> Ganadores Recientes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">{winners.map(w => (<div key={w.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-4 flex items-center gap-5 hover:shadow-md transition"><div className="bg-gradient-to-br from-logo-gold to-logo-yellow text-white w-14 h-14 flex items-center justify-center font-black text-sm rounded-2xl shadow-lg shadow-yellow-200">#{w.ticketNumber}</div><div><div className="font-bold text-slate-800 text-lg uppercase">{w.userName}</div><div className="text-xs text-logo-pink font-bold uppercase tracking-wide">{w.prizeTitle}</div></div></div>))}</div>
      </div>
    </div>
  );
};

const Wall = ({ user }: { user: User }) => {
  const [posts, setPosts] = useState<Post[]>(db.getPosts().sort((a,b) => b.timestamp - a.timestamp));
  const [newPost, setNewPost] = useState('');
  const [imageFile, setImageFile] = useState<string | null>(null);

  const handlePost = () => {
    if (!newPost.trim() && !imageFile) return;
    const post: Post = { id: crypto.randomUUID(), userId: user.id, content: newPost, imageUrl: imageFile || undefined, likes: [], shares: 0, comments: [], timestamp: Date.now() };
    const updated = [post, ...posts];
    setPosts(updated);
    db.savePosts(updated);
    setNewPost(''); setImageFile(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setImageFile(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getUserInfo = (uid: string) => { const u = db.getUsers().find(user => user.id === uid); return u || { name: 'User', surname: 'Unknown', avatar: '', role: UserRole.USER }; };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in pb-24">
      <div className="bg-white rounded-[2.5rem] shadow-soft p-8 mb-8 border border-slate-50 relative overflow-hidden group">
        <div className="flex gap-5 mb-6"><img src={user.avatar || "https://ui-avatars.com/api/?background=random"} className="w-14 h-14 rounded-full border-4 border-slate-50 shadow-sm" alt="me" /><div className="flex-1"><textarea className="w-full bg-slate-50 rounded-2xl p-5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-logo-teal/20 resize-none text-slate-700 text-base font-medium transition placeholder-slate-400" placeholder={`¿Qué hay de nuevo, ${user.name}?`} rows={2} value={newPost} onChange={(e) => setNewPost(e.target.value)}></textarea></div></div>
        <div className="flex justify-between items-center px-2"><label className="cursor-pointer text-logo-blue bg-blue-50 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide flex items-center gap-2 hover:bg-blue-100 transition"><span>📷 Subir Foto</span><input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label>{imageFile && <span className="text-[10px] text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full animate-pulse">Imagen Lista</span>}<button onClick={handlePost} className="bg-gradient-to-r from-logo-blue to-logo-teal text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-teal-200 transition transform hover:-translate-y-0.5">Publicar</button></div>
      </div>
      <div className="space-y-8">
        {posts.map(post => {
          const author = getUserInfo(post.userId);
          const isR33 = author.role === UserRole.R33;
          return (
            <div key={post.id} className={`bg-white rounded-[2.5rem] shadow-sm p-8 relative border ${isR33 ? 'border-logo-gold/50' : 'border-slate-50'}`}>
              <div className="flex items-center mb-6"><img src={author.avatar || `https://ui-avatars.com/api/?name=${author.name}&background=random`} className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-slate-100" alt="ava" /><div><div className="font-black text-logo-blue text-base uppercase flex items-center gap-2">{author.name} {author.surname} {isR33 && <span className="text-[9px] bg-logo-gold text-white px-2 py-0.5 rounded-md shadow-sm">LÍDER R33</span>}</div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{new Date(post.timestamp).toLocaleString()}</div></div></div>
              <p className="text-slate-700 mb-6 text-lg leading-relaxed font-medium">{post.content}</p>
              {post.imageUrl && <div className="rounded-3xl overflow-hidden mb-6 border border-slate-100 shadow-sm"><img src={post.imageUrl} className="w-full max-h-[500px] object-cover" alt="post" /></div>}
              <div className="flex items-center gap-4 pt-4 border-t border-slate-50"><button className="text-sm font-bold text-slate-400 hover:text-logo-pink flex items-center gap-2 transition bg-slate-50 px-4 py-2 rounded-full">❤️ <span className="text-slate-600">{post.likes.length}</span></button></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PlaceholderPage = ({ title }: { title: string }) => (<div className="flex flex-col items-center justify-center h-[60vh] text-center px-6"><div className="text-9xl mb-6 opacity-20 grayscale">💡</div><h2 className="text-4xl font-black text-logo-blue mb-2 uppercase tracking-tighter">{title}</h2><p className="text-xs font-bold text-logo-teal uppercase tracking-widest">Próximamente disponible</p></div>);

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-4 pointer-events-none">
       <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex justify-between items-center w-full max-w-sm pointer-events-auto animate-slide-up">
        <div>
          <h4 className="font-bold text-sm mb-1">Instalar Aplicación</h4>
          <p className="text-xs text-slate-400">Mejor experiencia a pantalla completa</p>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={() => setShow(false)} className="text-xs font-bold text-slate-400 hover:text-white">Cerrar</button>
          <button onClick={handleInstall} className="bg-logo-teal text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-teal-600 transition shadow-lg shadow-teal-900/20">Instalar</button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('MURO'); 

  useEffect(() => { const saved = db.getCurrentUser(); if (saved) setCurrentUser(saved); }, []);
  const handleLogin = (user: User) => { setCurrentUser(user); db.setCurrentUser(user); setCurrentView('MURO'); };
  const handleLogout = () => { setCurrentUser(null); db.setCurrentUser(null); };

  if (!currentUser) return <><InstallPrompt /><Auth onLogin={handleLogin} /></>;

  return (
    <div className="min-h-screen pb-24 font-sans relative z-10">
      <InstallPrompt />
      <Navbar user={currentUser} setView={setCurrentView} currentView={currentView} onLogout={handleLogout} />
      <main className="pt-8">
        {currentView === 'MURO' && <Wall user={currentUser} />}
        {currentView === 'R33' && <The33 />}
        {currentView === 'APPS' && <Apps user={currentUser} />}
        {currentView === 'VOTAR' && <Polls user={currentUser} />}
        {currentView === 'PREMIOS' && <Prizes />}
        {currentView === 'CURSOS' && <PlaceholderPage title="Cursos" />}
        {currentView === 'LIBROS' && <PlaceholderPage title="Biblioteca" />}
        {currentView === 'PROFILE' && <Profile user={currentUser} onUpdate={setCurrentUser} onLogout={handleLogout} setView={setCurrentView} />}
        {currentView === 'ADMIN' && (
          (currentUser.role === UserRole.MASTER || currentUser.role === UserRole.ADMIN) 
          ? <AdminPanel user={currentUser} /> 
          : <div className="text-center p-20 text-slate-300 font-bold uppercase tracking-widest">Acceso Restringido</div>
        )}
      </main>
      <BottomNav currentView={currentView} setView={setCurrentView} />
      <footer className="text-center py-10 text-slate-300 text-[10px] mt-10 mb-20 md:mb-0 relative z-10 font-bold uppercase tracking-widest"><p>RETO33 © 2026</p></footer>
    </div>
  );
}