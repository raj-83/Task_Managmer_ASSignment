# 📝 Task Management App

A simple yet powerful Task Management web application built using **React.js** and **Supabase**. Users can sign up or log in, and manage their tasks — create, edit, and delete with real-time updates.

---

## ✨ Features

- 🔐 Authentication (Sign Up, Sign In using Supabase)
- 🗂 Create new tasks
- ✏️ Edit existing tasks
- 🗑 Delete tasks
- ✅ Real-time task updates
- 💾 Supabase as a backend (Database + Auth)

---

## 🛠 Tech Stack

- **Frontend:** React.js, Tailwind CSS (optional)
- **Backend/Database:** Supabase (PostgreSQL + Auth)
- **Deployment:** Vercel / Netlify / Any static host

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/task-manager-supabase.git
cd task-manager-supabase


#2. Install Dependencies
bash
Copy
Edit
npm install


3. Set up Supabase
Go to https://supabase.com/ and create a project.

In your Supabase project:

Go to Authentication → Settings → Enable Email Auth

Go to Table Editor and create a new table tasks with the following columns:

id (UUID, Primary Key, Default: uuid_generate_v4())

user_id (UUID or TEXT)

title (TEXT)

description (TEXT, optional)

is_complete (BOOLEAN, default false)

created_at (TIMESTAMP, default now())

Enable Row Level Security (RLS) and add a policy:

sql
Copy
Edit
-- Allow users to manage their own tasks
CREATE POLICY "Users can manage their tasks"
ON tasks FOR ALL
USING (auth.uid() = user_id);


4. Add Environment Variables
Create a .env file in the root of your project:

env
Copy
Edit
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
Replace the above with values from your Supabase Project Settings → API




5. Run the App
bash
Copy
Edit
npm run dev


