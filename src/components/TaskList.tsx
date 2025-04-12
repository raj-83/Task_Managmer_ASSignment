import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { toast } from 'react-hot-toast';
import { Check, Trash2, X, Edit2, Save } from 'lucide-react';

type Task = Database['public']['Tables']['tasks']['Row'];

interface EditingTask {
  id: string;
  title: string;
  description: string | null;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<EditingTask | null>(null);

  const fetchTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    // Subscribe to changes
    const channel = supabase
      .channel('tasks_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tasks]);

  const toggleTaskStatus = async (task: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: !task.is_completed })
        .eq('id', task.id)
        .eq('user_id', task.user_id);

      if (error) throw error;
      await fetchTasks();
      toast.success(`Task marked as ${!task.is_completed ? 'completed' : 'incomplete'}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteTask = async (id: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      await fetchTasks();
      toast.success('Task deleted successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask({
      id: task.id,
      title: task.title,
      description: task.description,
    });
  };

  const cancelEditing = () => {
    setEditingTask(null);
  };

  const saveTask = async () => {
    if (!editingTask) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: editingTask.title,
          description: editingTask.description,
        })
        .eq('id', editingTask.id);

      if (error) throw error;
      
      setEditingTask(null);
      await fetchTasks();
      toast.success('Task updated successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return <div className="text-center text-gray-500">No tasks yet. Create one above!</div>;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`bg-white shadow-md rounded-lg p-4 ${
            task.is_completed ? 'opacity-75' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {editingTask?.id === task.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Task title"
                  />
                  <textarea
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Task description"
                    rows={3}
                  />
                </div>
              ) : (
                <>
                  <h3
                    className={`text-lg font-semibold ${
                      task.is_completed ? 'line-through text-gray-500' : ''
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-gray-600 mt-1">{task.description}</p>
                  )}
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(task.created_at).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {editingTask?.id === task.id ? (
                <>
                  <button
                    onClick={saveTask}
                    className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                    title="Save changes"
                  >
                    <Save size={20} />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                    title="Cancel editing"
                  >
                    <X size={20} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEditing(task)}
                    className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                    title="Edit task"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => toggleTaskStatus(task)}
                    className={`p-2 rounded-full ${
                      task.is_completed
                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                    title={task.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {task.is_completed ? <X size={20} /> : <Check size={20} />}
                  </button>
                  <button
                    onClick={() => deleteTask(task.id, task.user_id)}
                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                    title="Delete task"
                  >
                    <Trash2 size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}