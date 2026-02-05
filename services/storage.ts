import { User, Poll, Post, Prize, Winner, UserRole } from '../types';
import { INITIAL_USERS } from '../constants';

const KEYS = {
  USERS: 'reto33_users',
  POLLS: 'reto33_polls',
  POSTS: 'reto33_posts',
  PRIZES: 'reto33_prizes',
  WINNERS: 'reto33_winners',
  CURRENT_USER: 'reto33_current_user',
};

// Initialize DB if empty
const initDB = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(KEYS.POLLS)) {
    localStorage.setItem(KEYS.POLLS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.POSTS)) {
    localStorage.setItem(KEYS.POSTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.PRIZES)) {
    localStorage.setItem(KEYS.PRIZES, JSON.stringify([]));
  }
  
  // Initialize The 33 Demos
  const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  const hasR33 = users.some((u: User) => u.role === UserRole.R33);
  if (!hasR33) {
    const firstNames = ["Alejandro", "Sofia", "Mateo", "Valentina", "Santiago", "Camila", "Daniel", "Isabella", "Nicolas", "Mariana", "Samuel", "Gabriela", "Sebastian", "Victoria", "Lucas", "Martina", "Matias", "Luciana", "Benjamin", "Valeria", "Joaquin", "Ximena", "Gabriel", "Maria", "Emilio", "Renata", "Diego", "Emilia", "Julian", "Natalia", "Leonardo", "Paula", "Adrian"];
    const lastNames = ["Garcia", "Rodriguez", "Lopez", "Martinez", "Gonzalez", "Perez", "Sanchez", "Ramirez", "Torres", "Flores", "Rivera", "Gomez", "Diaz", "Cruz", "Morales", "Reyes", "Gutierrez", "Ortiz", "Castillo", "Moreno", "Romero", "Alvarez", "Mendez", "Chavez", "Vargas", "Ramos", "Ruiz", "Hernandez", "Jimenez", "Silva", "Mendoza", "Rojas", "Delgado"];

    const demos: User[] = Array.from({ length: 33 }, (_, i) => ({
      id: `r33-${i}`,
      email: `r33user${i}@demo.com`,
      password: 'password',
      name: firstNames[i % firstNames.length],
      surname: lastNames[i % lastNames.length],
      age: 20 + (i % 15),
      phone: '0000000000',
      city: 'Santo Domingo' as any,
      sector: 'Centro',
      role: UserRole.R33,
      tickets: [],
      installationHistory: [],
      pollHistory: [],
      friends: [],
      following: [],
      bio: `Miembro oficial de Los 33. Comprometido con el cambio. Experiencia en liderazgo comunitario y gestión pública.`,
      avatar: `https://picsum.photos/seed/r33-${i}/150/150`
    }));
    localStorage.setItem(KEYS.USERS, JSON.stringify([...users, ...demos]));
  }
};

initDB();

export const db = {
  getUsers: (): User[] => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
  saveUsers: (users: User[]) => localStorage.setItem(KEYS.USERS, JSON.stringify(users)),
  
  getPolls: (): Poll[] => JSON.parse(localStorage.getItem(KEYS.POLLS) || '[]'),
  savePolls: (polls: Poll[]) => localStorage.setItem(KEYS.POLLS, JSON.stringify(polls)),
  
  getPosts: (): Post[] => JSON.parse(localStorage.getItem(KEYS.POSTS) || '[]'),
  savePosts: (posts: Post[]) => localStorage.setItem(KEYS.POSTS, JSON.stringify(posts)),
  
  getPrizes: (): Prize[] => JSON.parse(localStorage.getItem(KEYS.PRIZES) || '[]'),
  savePrizes: (prizes: Prize[]) => localStorage.setItem(KEYS.PRIZES, JSON.stringify(prizes)),

  getWinners: (): Winner[] => JSON.parse(localStorage.getItem(KEYS.WINNERS) || '[]'),
  saveWinners: (winners: Winner[]) => localStorage.setItem(KEYS.WINNERS, JSON.stringify(winners)),

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },
  getCurrentUser: (): User | null => {
    const u = localStorage.getItem(KEYS.CURRENT_USER);
    return u ? JSON.parse(u) : null;
  }
};

// Simulated Email Service
export const sendVerificationEmail = async (email: string, code: string) => {
  // @ts-ignore
  if (window.emailjs) {
    try {
      // @ts-ignore
      await window.emailjs.send(
        'service_pkc5h87',
        'template_rgm0xms',
        { to_email: email, verification_code: code },
        'owUYyPbGCKtFmhc8n'
      );
      return true;
    } catch (error) {
      console.error("EmailJS Error", error);
      return false;
    }
  }
  console.log(`[SIMULATION] Email sent to ${email} with code ${code}`);
  return true;
};