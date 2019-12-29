// remember authorization token in local storage
export function AccessToken() {
  return (target: any, key: string) => {
    const tokenKey = 'accessToken';

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
