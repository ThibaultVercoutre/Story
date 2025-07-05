declare module '#app' {
  interface NuxtApp {
    $auth: {
      loggedIn: boolean
      user: any
      loginWith: (strategy: string, options?: any) => Promise<any>
      logout: () => Promise<void>
    }
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $auth: {
      loggedIn: boolean
      user: any
      loginWith: (strategy: string, options?: any) => Promise<any>
      logout: () => Promise<void>
    }
  }
}

export {} 