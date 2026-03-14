import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (!session) {
    return (
      <div style={{ padding: 40 }}>
        <h1>YoPaws Dog Health Tracker</h1>
        <button onClick={signInWithGoogle}>
          Login with Google
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>YoPaws Dog Health Tracker</h1>
      <p>Logged in as {session.user.email}</p>

      <button onClick={signOut}>Sign out</button>
    </div>
  );
}

export default App;
