// Typy dla Google Identity Services

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

// Typ klasycznego GoogleUser (z One Tap JWT)
export interface GoogleUser {
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
}

// Typ uproszczony - profil z endpointu userinfo (klasyczny OAuth)
export interface GoogleAllUser {
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  [key: string]: any;
}

export interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'document';
  url: string;
  name: string;
  size: number;
}

export interface ReportData {
  title: string;
  description: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Rozszerzenie Window dla Google API
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { 
            client_id: string; 
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notification?: (notification: any) => void) => void;
          disableAutoSelect: () => void;
          renderButton: (element: HTMLElement, config: {
            theme?: string;
            size?: string;
            width?: string;
            text?: string;
            shape?: string;
            locale?: string;
          }) => void;
        };
      };
    };
  }
}
