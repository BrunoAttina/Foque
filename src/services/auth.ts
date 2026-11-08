import { supabase } from './supabase';

export interface Perfil {
  id: string;
  username: string | null;
}

/** Converte erros do Supabase em mensagens para a pessoa. */
function mensagemDeErro(erro: { code?: string; message: string }): string {
  switch (erro.code) {
    case 'invalid_credentials':
      return 'E-mail ou senha incorretos.';
    case 'email_not_confirmed':
      return 'Confirme seu e-mail antes de entrar. Procure o link na sua caixa de entrada.';
    case 'user_already_exists':
    case 'email_exists':
      return 'Já existe uma conta com esse e-mail.';
    case 'weak_password':
      return 'Essa senha é fraca. Tente uma mais longa.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Muitas tentativas. Espere alguns minutos e tente de novo.';
    case '23505':
      return 'Esse @ já está em uso.';
    default:
      return 'Algo deu errado. Verifique sua conexão e tente de novo.';
  }
}

export class ErroAuth extends Error {}

export async function usernameDisponivel(username: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('username_disponivel', { nome: username });
  if (error) throw new ErroAuth(mensagemDeErro(error));
  return data === true;
}

/** Cria a conta. Retorna true se já entrou, ou false se precisa confirmar o e-mail. */
export async function cadastrar(email: string, senha: string, username: string): Promise<boolean> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password: senha,
    options: { data: { username } },
  });
  if (error) throw new ErroAuth(mensagemDeErro(error));
  return data.session !== null;
}

export async function entrar(email: string, senha: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
  if (error) throw new ErroAuth(mensagemDeErro(error));
}

export async function sair(): Promise<void> {
  await supabase.auth.signOut();
}

export async function buscarPerfil(userId: string): Promise<Perfil | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new ErroAuth(mensagemDeErro(error));
  return data;
}

export async function definirUsername(userId: string, username: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ username }).eq('id', userId);
  if (error) throw new ErroAuth(mensagemDeErro(error));
}
