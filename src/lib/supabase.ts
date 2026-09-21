export const DEFAULT_SUPABASE_URL = 'https://fvnwqeumcxifqjqovemg.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

export const isSupabaseConfigured = false;

export const supabase = {
  auth: {
    getSession: async () => {
      const user = localStorage.getItem('placement_ops_current_user');
      if (user) {
        try {
          const parsed = JSON.parse(user);
          return { data: { session: { user: parsed, access_token: parsed.id } }, error: null };
        } catch {}
      }
      return {
        data: {
          session: {
            user: { id: 'demo-student-01', email: 'aditya.sharma@example.com', name: 'Aditya Sharma', role: 'student' },
            access_token: 'demo-token'
          }
        },
        error: null
      };
    },
    getUser: async () => {
      const res = await supabase.auth.getSession();
      return { data: { user: res.data.session?.user || null }, error: null };
    },
    signOut: async () => {
      localStorage.removeItem('placement_ops_current_user');
      localStorage.removeItem('placement_ops_token');
    }
  }
};

export async function signOutCompletely() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('placement_ops_token');
    localStorage.removeItem('placement_ops_current_user');
    localStorage.removeItem('placement_ops_user');
    localStorage.removeItem('placement_ops_demo_user');
  }
}
