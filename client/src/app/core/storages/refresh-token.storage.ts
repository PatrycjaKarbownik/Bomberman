// remember refresh token in session storage
export function RefreshToken() {
  return (target: any, key: string) => {
    const tokenKey = 'refreshToken';

    Object.defineProperty(target, key, {
      get: () => {
        return JSON.parse(sessionStorage.getItem(tokenKey));
      },
      set: (token: string) => {
        sessionStorage.setItem(tokenKey, JSON.stringify("Bearer " + token));
      }
    });
  };
}
