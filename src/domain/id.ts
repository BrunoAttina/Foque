/**
 * UUID v4 gerado no aparelho. Serve de identificador da sessão para o servidor
 * não somar pontos duas vezes quando a fila offline reenviar a mesma sessão.
 * Não é criptográfico, e não precisa ser: só precisa não colidir.
 */
export function novoUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
