
import React, { useState } from 'react';

interface AuthProps {
  onLoginSuccess: () => void;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'RESET';

// Helper to get users from localStorage
const getUsers = () => {
    try {
        const users = localStorage.getItem('bete_users');
        return users ? JSON.parse(users) : {};
    } catch (e) {
        return {};
    }
};

// Helper to save users to localStorage
const saveUsers = (users: object) => {
    localStorage.setItem('bete_users', JSON.stringify(users));
};

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  // UI states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearFormState = () => {
    setError(null);
    setSuccess(null);
    setIsLoading(false);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearFormState();
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    clearFormState();
    setIsLoading(true);

    if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
        setIsLoading(false);
        return;
    }
    if (password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.");
        setIsLoading(false);
        return;
    }

    const allowedDomains = ['artplan.com.br', 'betmgm.com.br'];
    const personalEmailWhitelist = ['caiorcastro@gmail.com']; 
    const emailDomain = email.split('@')[1];
    const lowerCaseEmail = email.toLowerCase();

    if (!allowedDomains.includes(emailDomain) && !personalEmailWhitelist.includes(lowerCaseEmail)) {
        setError("Acesso restrito. Use um e-mail @artplan.com.br ou @betmgm.com.br.");
        setIsLoading(false);
        return;
    }

    setTimeout(() => {
        const users = getUsers();
        if (users[lowerCaseEmail]) {
            setError("Este e-mail já está registrado.");
            setIsLoading(false);
            return;
        }

        // Simple "hashing" for simulation - DO NOT USE IN PRODUCTION
        const hashedPassword = btoa(password); 
        users[lowerCaseEmail] = { name, password: hashedPassword };
        saveUsers(users);

        setSuccess("Conta criada com sucesso! Por favor, faça o login.");
        switchMode('LOGIN');
    }, 1000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    clearFormState();
    setIsLoading(true);
    
    setTimeout(() => {
        const users = getUsers();
        const lowerCaseEmail = email.toLowerCase();
        const user = users[lowerCaseEmail];

        if (user && atob(user.password) === password) {
            onLoginSuccess();
        } else {
            setError("E-mail ou senha inválidos.");
            setIsLoading(false);
        }
    }, 1000);
  };
  
  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    clearFormState();
    setIsLoading(true);
    // This remains a simulation as we can't send emails from the frontend.
    setTimeout(() => {
        setSuccess("Se uma conta existir para este e-mail, um link de redefinição foi enviado (simulação).");
        setIsLoading(false);
    }, 1500);
  };

  const renderForm = () => {
    switch (mode) {
      case 'REGISTER':
        return (
          <form onSubmit={handleRegister} className="space-y-4">
            <h3 className="text-xl font-bold text-center text-white">Criar Conta</h3>
            <div>
              <input type="text" placeholder="Nome Completo" required value={name} onChange={e => setName(e.target.value)} className="input-field" />
            </div>
            <div>
              <input type="email" placeholder="E-mail Corporativo" required value={email} onChange={e => setEmail(e.target.value)} className="input-field" />
            </div>
            <div>
              <input type="password" placeholder="Senha" required value={password} onChange={e => setPassword(e.target.value)} className="input-field" />
            </div>
            <div>
              <input type="password" placeholder="Confirmar Senha" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field" />
            </div>
            <button type="submit" className="button-primary w-full" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Conta'}
            </button>
            <p className="text-center text-sm text-gray-400">
              Já tem uma conta? <button type="button" onClick={() => switchMode('LOGIN')} className="font-semibold text-primary hover:underline">Faça Login</button>
            </p>
          </form>
        );
      case 'RESET':
        return (
          <form onSubmit={handleReset} className="space-y-4">
            <h3 className="text-xl font-bold text-center text-white">Redefinir Senha</h3>
            <p className="text-sm text-center text-gray-400">Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>
            <div>
              <input type="email" placeholder="Seu E-mail" required value={email} onChange={e => setEmail(e.target.value)} className="input-field" />
            </div>
            <button type="submit" className="button-primary w-full" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar Link'}
            </button>
            <p className="text-center text-sm text-gray-400">
              Lembrou sua senha? <button type="button" onClick={() => switchMode('LOGIN')} className="font-semibold text-primary hover:underline">Faça Login</button>
            </p>
          </form>
        );
      case 'LOGIN':
      default:
        return (
          <form onSubmit={handleLogin} className="space-y-4">
            <h3 className="text-xl font-bold text-center text-white">Acessar Painel</h3>
            <div>
              <input type="email" placeholder="E-mail" required value={email} onChange={e => setEmail(e.target.value)} className="input-field" />
            </div>
            <div>
              <input type="password" placeholder="Senha" required value={password} onChange={e => setPassword(e.target.value)} className="input-field" />
            </div>
            <div className="text-right text-sm">
                <button type="button" onClick={() => switchMode('RESET')} className="font-semibold text-gray-400 hover:text-primary hover:underline">Esqueceu a senha?</button>
            </div>
            <button type="submit" className="button-primary w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
            <p className="text-center text-sm text-gray-400">
              Não tem uma conta? <button type="button" onClick={() => switchMode('REGISTER')} className="font-semibold text-primary hover:underline">Crie uma Agora</button>
            </p>
          </form>
        );
    }
  };

  return (
    <div className="bg-card-dark border border-gray-800 rounded-lg p-6 sm:p-8 shadow-2xl relative">
      <style>{`
        .input-field {
          width: 100%;
          background-color: #121212;
          color: white;
          placeholder-color: #6b7280;
          border: 1px solid #4a4a4a;
          border-radius: 0.375rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-field:focus {
          border-color: #C19A6B;
          box-shadow: 0 0 0 2px rgba(193, 154, 107, 0.3);
        }
        .button-primary {
          background-color: #C19A6B;
          color: black;
          font-weight: bold;
          padding: 0.75rem 1rem;
          border-radius: 0.375rem;
          transition: opacity 0.2s;
        }
        .button-primary:hover {
          opacity: 0.9;
        }
        .button-primary:disabled {
          background-color: #4a4a4a;
          cursor: not-allowed;
        }
      `}</style>

      {error && <div className="bg-red-500/20 border border-red-500 text-red-400 text-sm p-3 rounded-md mb-4 text-center">{error}</div>}
      {success && <div className="bg-green-500/20 border border-green-500 text-green-400 text-sm p-3 rounded-md mb-4 text-center">{success}</div>}
      
      {renderForm()}
    </div>
  );
};

export default Auth;
