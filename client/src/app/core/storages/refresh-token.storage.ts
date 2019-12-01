// remember refresh token in local storage
export function RefreshToken() {
  return (target: any, key: string) => {
    const tokenKey = 'refreshToken';

    Object.defineProperty(target, key, {
      get: () => {
        return JSON.parse(localStorage.getItem(tokenKey));
      },
      set: (token: string) => {
        localStorage.setItem(tokenKey, JSON.stringify("Bearer " + token));
      }
    });
  };
}
