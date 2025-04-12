import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { User } from './types/database';
import AuthForm from './components/AuthForm';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { Toaster } from 'react-hot-toast';
import { LogOut, CheckSquare } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      {user ? (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <CheckSquare className="text-blue-500" size={32} />
              <h1 className="text-3xl font-bold text-gray-800">Task Manager</h1>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
          
          <TaskForm onTaskAdded={() => {}} />
          <TaskList />
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <AuthForm />
        </div>
      )}
    </div>
  );
}

export default App;