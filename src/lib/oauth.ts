// Official OAuth 2.0 & Google Identity Services integration

declare global {
  interface Window {
    google?: any;
  }
}

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '612543971842-q4bknu4m82c3n8dks8j2g8k0h0k5n6b3.apps.googleusercontent.com'; // Default or configured client ID

export const GITHUB_CLIENT_ID =
  import.meta.env.VITE_GITHUB_CLIENT_ID || 'Ov23liSKILL2CAREER';

export const LINKEDIN_CLIENT_ID =
  import.meta.env.VITE_LINKEDIN_CLIENT_ID || '78skill2career';

/**
 * Initiates official Google OAuth 2.0 Sign In
 */
export async function triggerGoogleOAuth(): Promise<{
  provider: 'google';
  email: string;
  full_name: string;
  avatar_url: string;
}> {
  return new Promise((resolve, reject) => {
    // 1. Check if Google Identity Services is available
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              reject(new Error(tokenResponse.error_description || tokenResponse.error));
              return;
            }

            try {
              // Fetch verified Google Userinfo directly from official Google endpoint
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`,
                },
              });

              if (!res.ok) {
                throw new Error('Failed to retrieve user info from Google.');
              }

              const userInfo = await res.json();
              resolve({
                provider: 'google',
                email: userInfo.email,
                full_name: userInfo.name || userInfo.email.split('@')[0],
                avatar_url: userInfo.picture || '',
              });
            } catch (fetchErr: any) {
              reject(fetchErr);
            }
          },
          error_callback: (err: any) => {
            reject(new Error(err?.message || 'Google sign-in was cancelled or encountered an error.'));
          }
        });

        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('Google GSI init failed, falling back to OAuth popup:', err);
      }
    }

    // 2. Fallback to official Google OAuth 2.0 authorization URL in popup
    const redirectUri = `${window.location.origin}/auth/callback`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      GOOGLE_CLIENT_ID
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=openid%20email%20profile&prompt=select_account`;

    const popup = window.open(
      googleAuthUrl,
      'GoogleSignIn',
      'width=500,height=600,menubar=no,toolbar=no,status=no'
    );

    if (!popup) {
      // If popup blocked, redirect directly
      window.location.href = googleAuthUrl;
      return;
    }

    const messageListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.provider === 'google') {
        window.removeEventListener('message', messageListener);
        popup.close();
        resolve(event.data.payload);
      }
    };

    window.addEventListener('message', messageListener);
  });
}

/**
 * Initiates official GitHub OAuth 2.0 Sign In
 */
export function triggerGithubOAuth() {
  const redirectUri = `${window.location.origin}/auth/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
    GITHUB_CLIENT_ID
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20user:email`;

  window.location.href = githubAuthUrl;
}

/**
 * Initiates official LinkedIn OAuth 2.0 Sign In
 */
export function triggerLinkedinOAuth() {
  const redirectUri = `${window.location.origin}/auth/callback`;
  const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(
    LINKEDIN_CLIENT_ID
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email`;

  window.location.href = linkedinAuthUrl;
}
