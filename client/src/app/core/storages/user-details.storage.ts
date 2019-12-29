// remember username in session storage
export function Username() {
  return (target: any, key: string) => {
    const usernameKey = 'username';

    Object.defineProperty(target, key, {
      get: () => {
        return JSON.parse(sessionStorage.getItem(usernameKey));
      },
      set: (username: string) => {
        sessionStorage.setItem(usernameKey, JSON.stringify(username));
      }
    });
  };
}

// remember userId in session storage
export function UserId() {
  return (target: any, key: string) => {
    const userIdKey = 'userId';

    Object.defineProperty(target, key, {
      get: () => {
        return JSON.parse(sessionStorage.getItem(userIdKey));
      },
      set: (userId: string) => {
        sessionStorage.setItem(userIdKey, JSON.stringify(userId));
      }
    });
  };
}
