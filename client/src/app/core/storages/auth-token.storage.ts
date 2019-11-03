// remember token in local storage
export function AuthToken() {
  return (target: any, key: string) => {
    const tokenKey = 'authToken';

    Object.defineProperty(target, key, {
      get: () => {
        return JSON.parse(localStorage.getItem(tokenKey));
      },
      set: (token: string) => {
        localStorage.setItem(tokenKey, JSON.stringify(token));
      }
    });
  };
}
