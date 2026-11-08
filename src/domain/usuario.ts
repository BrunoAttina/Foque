// Regras de conta: nome de usuário (@), e-mail e senha. Funções puras.
// A mesma regra do @ existe no banco (supabase/migrations/0001_usuarios_e_seguidores.sql).

export const USERNAME_MINIMO = 3;
export const USERNAME_MAXIMO = 20;
export const SENHA_MINIMA = 8;

const USERNAME_REGEX = /^[a-z0-9_.]{3,20}$/;

/** Tira espaços e o "@" do começo e passa para minúsculas. */
export function normalizarUsername(texto: string): string {
  return texto.trim().replace(/^@+/, '').toLowerCase();
}

/** Retorna a mensagem de erro, ou null se o @ é válido. Espera o valor já normalizado. */
export function validarUsername(username: string): string | null {
  if (username.length < USERNAME_MINIMO || username.length > USERNAME_MAXIMO) {
    return `O @ deve ter entre ${USERNAME_MINIMO} e ${USERNAME_MAXIMO} caracteres.`;
  }
  if (!USERNAME_REGEX.test(username)) {
    return 'Use só letras minúsculas, números, "_" e ".".';
  }
  return null;
}

export function validarEmail(email: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? null : 'Informe um e-mail válido.';
}

export function validarSenha(senha: string): string | null {
  return senha.length >= SENHA_MINIMA ? null : `A senha deve ter pelo menos ${SENHA_MINIMA} caracteres.`;
}
