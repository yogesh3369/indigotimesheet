# Backend Setup - Supabase Integration

## ✅ Completed Changes

### 1. Database Configuration
- **Project ID**: `gjojnjmwxdsagcjksmwc`
- **Project URL**: `https://gjojnjmwxdsagcjksmwc.supabase.co`
- Updated `.env` file with correct Supabase credentials

### 2. Database Schema
The following tables are configured with Row Level Security (RLS):

#### **profiles**
- Stores user profile information
- Auto-created on signup via trigger
- Fields: `id`, `user_id`, `email`, `first_name`, `last_name`, `created_at`, `updated_at`

#### **user_roles**
- Manages user permissions (admin/user)
- Default role: `user`
- Fields: `id`, `user_id`, `role`, `created_at`

#### **projects**
- Pre-populated with 6 sample projects:
  - Development
  - Design
  - Testing
  - Documentation
  - Meetings
  - Research
- Fields: `id`, `project_name`, `description`, `status`, `created_at`, `updated_at`

#### **tasks**
- Stores time tracking entries
- Fields: `id`, `user_id`, `project_id`, `task_name`, `date`, `hours`, `minutes`, `total_minutes`, `notes`, `created_at`, `updated_at`

### 3. Authentication Flow
- **Sign Up**: Automatically creates profile and assigns default user role
- **Sign In**: Uses Supabase Auth with email/password
- **Session Management**: Persistent sessions with auto-refresh
- **Database Trigger**: `handle_new_user()` function creates profile on signup

### 4. Row Level Security (RLS) Policies

#### Profiles
- Users can view and update their own profile only

#### Projects
- All authenticated users can view active projects
- Only admins can manage (create/update/delete) projects

#### Tasks
- Users can only view, create, update, and delete their own tasks
- Complete isolation between users

#### User Roles
- Users can view their own roles

### 5. TypeScript Types
- Generated TypeScript types from database schema
- Located at: `src/integrations/supabase/types.ts`
- Provides full type safety for database operations

### 6. Security
- Fixed function search_path security warning
- All tables have RLS enabled
- Proper foreign key relationships
- Secure DEFINER functions with stable search_path

## 🚀 How to Use

### Start Development Server
```bash
npm run dev
```

### Test Authentication
1. Navigate to `/auth`
2. Create a new account (Sign Up tab)
3. Profile and user role will be created automatically
4. Login with your credentials

### Add Tasks
1. Go to `/add-task`
2. Select a project from the dropdown
3. Fill in task details (name, date, hours, minutes, notes)
4. Can add multiple tasks at once (up to 20)
5. Click "Save All"

### View Dashboard
- Navigate to `/dashboard`
- See statistics for today, this week, and this month
- View time consumption chart
- Filter by date range (7/30/90 days)

### View History
- Navigate to `/history`
- Search tasks by name
- Group by date or project
- Delete tasks with confirmation dialog

## 📝 Environment Variables

```env
VITE_SUPABASE_PROJECT_ID="gjojnjmwxdsagcjksmwc"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://gjojnjmwxdsagcjksmwc.supabase.co"
```

## 🔒 Security Notes

1. **RLS is enabled** on all tables - users can only access their own data
2. **Leaked password protection** warning can be enabled in Supabase dashboard under Auth settings
3. All database functions use `SECURITY DEFINER` with stable `search_path`
4. API keys are properly configured for client-side usage

## 🎯 Next Steps (Optional)

1. Enable leaked password protection in Supabase Auth settings
2. Add email confirmation for new signups
3. Implement password reset functionality
4. Add admin panel for project management
5. Export timesheet reports (CSV/PDF)
6. Add team collaboration features
