import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; data: { user: User } | null }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: AuthError | null; user: User | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // --- Início da verificação de sessão na montagem do componente ---
    console.log('AuthContext useEffect: Iniciando verificação de sessão inicial...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthContext useEffect: getSession resultado na montagem:', session ? `Sessão válida para ${session.user.id}` : 'Nenhuma sessão encontrada');
      if (session) {
        setUser(session.user);
        console.log('AuthContext useEffect: User set from getSession. User ID:', session.user.id);
      }
      setLoading(false);
      console.log('AuthContext useEffect: Loading set to false após getSession.');
    }).catch(error => {
      console.error('AuthContext useEffect: Erro ao buscar sessão inicial:', error);
      setLoading(false); // Garantir que loading seja false mesmo em caso de erro
    });

    // --- Listener para mudanças no estado de autenticação ---
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext onAuthStateChange: Evento:', event, 'Sessão:', session ? `Válida para ${session.user?.id}` : 'Nula'); // LOG CRÍTICO AQUI

        // Lógica para deslogar em caso de sessão inválida/expirada
        if (event === 'SIGNED_OUT' || // Usuário deslogou explicitamente
            event === 'USER_DELETED' || // Usuário foi deletado
            (event === 'TOKEN_REFRESHED' && !session) || // Token renovado, mas a sessão é nula (falha na renovação)
            event === 'TOKEN_REFRESH_FAILED') { // Falha explícita na renovação do token
          
          setUser(null);
          console.log('AuthContext onAuthStateChange: Sessão encerrada/inválida. Redirecionando para login.');
          navigate('/login', {
            state: {
              message: 'Sua sessão expirou. Por favor, faça login novamente.'
            }
          });
          return; // Importante para parar a execução
        }

        // Se a sessão é válida, define o usuário
        if (session) {
          setUser(session.user);
          console.log('AuthContext onAuthStateChange: Usuário definido para o estado:', session.user?.id);
        }
      }
    );

    return () => {
      console.log('AuthContext useEffect: Desinscrevendo do onAuthStateChange.');
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    console.log('AuthContext signIn: Iniciando login para:', email);
    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.error('AuthContext signIn: Erro ao fazer login com credenciais:', signInError);
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos');
        }
        if (signInError.message.includes('Email not confirmed')) {
          throw new Error('Por favor, confirme seu email antes de fazer login');
        }
        throw signInError; // Joga outros erros específicos do signInWithPassword
      }

      if (!authData.user) {
        console.error('AuthContext signIn: Nenhum usuário retornado após signInWithPassword.');
        throw new Error('Erro ao fazer login: Usuário não autenticado.');
      }
      console.log('AuthContext signIn: Usuário autenticado com ID:', authData.user.id);

      // --- Pega dados do perfil do usuário na tabela 'users' ---
      // Esta é a requisição que mais tem causado problemas (RLS ou perfil inexistente)
      const { data: userData, error: userError } = await supabase
        .from('users') // Nome da tabela de perfil de usuário (correto pelo seu diagrama)
        .select('*') // Seleciona todos os campos do perfil
        .eq('id', authData.user.id) // Busca pelo ID do usuário autenticado
        .maybeSingle(); // Espera 0 ou 1 resultado

      if (userError) {
        console.error('AuthContext signIn: Erro ao buscar dados do perfil do usuário:', userError);
        throw new Error(`Erro ao carregar dados do usuário: ${userError.message}`);
      }

      if (!userData) {
        // Se userData é null, significa que o perfil não foi encontrado.
        // Isso pode ser por RLS ou porque o perfil não foi criado após o sign-up.
        console.warn('AuthContext signIn: Perfil do usuário não encontrado na tabela "users" para ID:', authData.user.id);
        await supabase.auth.signOut(); // Desloga o usuário se o perfil não for encontrado
        throw new Error('Usuário não encontrado em nossos registros. Por favor, faça o cadastro primeiro.');
      }
      console.log('AuthContext signIn: Dados do perfil do usuário carregados:', userData);

      // --- Atualiza metadados do usuário em auth.users com os dados completos do perfil ---
      // Isso torna os dados do perfil acessíveis via user.user_metadata em toda a aplicação.
      if (Object.keys(userData).length > 0) { // Verifica se userData não está vazio antes de atualizar
        const { error: updateError } = await supabase.auth.updateUser({
          data: userData // userData é o objeto do perfil (full_name, type, cpf, etc.)
        });

        if (updateError) {
          console.error('AuthContext signIn: Erro ao atualizar metadados do usuário:', updateError);
        } else {
          console.log('AuthContext signIn: Metadados do usuário atualizados com sucesso.');
        }
      } else {
        console.warn('AuthContext signIn: userData vazio, pulando atualização de metadados.');
      }
      
      authData.user.user_metadata = userData; // Atualiza o objeto retornado para garantir que o user_metadata está presente imediatamente.

      console.log('AuthContext signIn: Login concluído com sucesso.');
      return { data: authData, error: null }; // Retorna sucesso
    } catch (error) {
      console.error('AuthContext signIn: Erro catastrófico no processo de signIn:', error);
      return {
        data: null,
        error: {
          name: 'AuthError',
          message: error instanceof Error ? error.message : 'Erro ao fazer login',
          status: 400 // Status genérico para erro de login
        } as AuthError
      };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    console.log('AuthContext signUp: Iniciando cadastro para:', email, 'com dados:', userData);
    try {
      // --- Verificação de Existência de E-mail ---
      const { data: existingUser, error: existingUserError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle(); 

      if (existingUserError) {
          console.error('AuthContext signUp: Erro ao verificar e-mail existente:', existingUserError);
          throw new Error('Erro ao verificar e-mail. Por favor, tente novamente.');
      }
      if (existingUser) {
        throw new Error('Este email já está cadastrado');
      }
      console.log('AuthContext signUp: E-mail disponível.');

      // --- Verifique restrições exclusivas com base no tipo de usuário (CPF/CNES) ---
      if (userData.type === 'client' && userData.cpf) {
        const { data: existingCPF, error: existingCPFError } = await supabase
          .from('users')
          .select('id')
          .eq('cpf', userData.cpf)
          .maybeSingle(); 
        
        if (existingCPFError) {
            console.error('AuthContext signUp: Erro ao verificar CPF existente:', existingCPFError);
            throw new Error('Erro ao verificar CPF. Por favor, tente novamente.');
        }
        if (existingCPF) {
          throw new Error('Este CPF já está cadastrado');
        }
        console.log('AuthContext signUp: CPF disponível.');
      } else if (userData.type === 'laboratory' && userData.cnes) {
        const { data: existingCNES, error: existingCNESError } = await supabase
          .from('users')
          .select('id')
          .eq('cnes', userData.cnes)
          .maybeSingle(); 

        if (existingCNESError) {
            console.error('AuthContext signUp: Erro ao verificar CNES existente:', existingCNESError);
            throw new Error('Erro ao verificar CNES. Por favor, tente novamente.');
        }
        if (existingCNES) {
          throw new Error('Este CNES já está cadastrado');
        }
        console.log('AuthContext signUp: CNES disponível.');
      }

      // --- Cria usuário de autenticação (auth.users) ---
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData // Isso adiciona userData como user_metadata em auth.users
        }
      });

      if (signUpError) {
        console.error('AuthContext signUp: Erro ao criar usuário no Auth:', signUpError);
        throw signUpError;
      }
      if (!authData.user) {
        console.error('AuthContext signUp: Nenhum usuário retornado após signUp.');
        throw new Error('Erro ao criar usuário: Usuário não criado.');
      }
      console.log('AuthContext signUp: Usuário criado no Auth com ID:', authData.user.id);

      // --- Cria perfil do usuário na sua tabela 'public.users' ---
      // A política RLS de INSERT para public.users deve estar correta: auth.uid() = id
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id, // ID do usuário autenticado
          email, // Email do usuário
          ...userData // Outros dados do perfil (full_name, type, cpf, etc.)
        });

      if (insertError) {
        console.error('AuthContext signUp: Erro ao inserir perfil do usuário na tabela "users":', insertError);
        await supabase.auth.signOut(); 
        throw insertError;
      }
      console.log('AuthContext signUp: Perfil do usuário inserido com sucesso na tabela "users".');

      console.log('AuthContext signUp: Cadastro concluído com sucesso.');
      return { error: null, user: authData.user };
    } catch (error) {
      console.error('AuthContext signUp: Erro catastrófico no processo de signUp:', error);
      return { 
        error: error instanceof Error ? { name: 'AuthError', message: error.message, status: 400 } as AuthError : { name: 'AuthError', message: 'Erro desconhecido no cadastro', status: 400 } as AuthError, 
        user: null 
      };
    }
  };

  const signOut = async () => {
    console.log('AuthContext signOut: Iniciando logout...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthContext signOut: Erro ao fazer logout:', error);
        if (
          error.message.includes('session_not_found') ||
          error.message.includes('refresh_token_not_found') ||
          error.status === 403 
        ) {
          setUser(null);
          console.log('AuthContext signOut: Sessão já inexistente no servidor, limpando estado local e redirecionando.');
          navigate('/login', {
            state: {
              message: 'Sua sessão expirou. Por favor, faça login novamente.'
            }
          });
          return; 
        }
        throw error; 
      }
      setUser(null);
      console.log('AuthContext signOut: Logout bem-sucedido. Redirecionando para login.');
      navigate('/login');
    } catch (error) {
      console.error('AuthContext signOut: Erro catastrófico no processo de signOut:', error);
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}