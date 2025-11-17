# Admin User Setup Guide

## Creating Your First Admin User

After implementing the authentication system, you need to manually create your first admin user through the Supabase SQL Editor.

### Step 1: Sign Up a User Account

1. Navigate to `/auth` in your application
2. Click on the "Sign Up" tab
3. Create an account with your email and password
4. Check your email for the verification link (if email confirmation is enabled)
5. Note your user ID - you'll need this for the next step

### Step 2: Find Your User ID

You can find your user ID in two ways:

**Option A: From Supabase Dashboard**
1. Go to [Supabase Authentication > Users](https://supabase.com/dashboard/project/apdxtdarwacdcuhvtaag/auth/users)
2. Find your email in the list
3. Copy the UUID from the "ID" column

**Option B: From SQL Editor**
```sql
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

### Step 3: Assign Admin Role

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/apdxtdarwacdcuhvtaag/sql/new)
2. Run the following SQL command (replace `YOUR_USER_ID` with the actual UUID):

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin');
```

### Step 4: Verify Admin Access

1. Log out and log back in to refresh your session
2. Navigate to `/admin`
3. You should now have access to the admin dashboard

## Creating Additional Admin Users

To create more admin users, repeat the process above, or create a user management interface in the admin dashboard.

## Role Types

The system supports three role types:

- **admin**: Full access to admin dashboard and all administrative functions
- **ops**: Operations access (can view/manage leads and data)
- **user**: Standard user access (default for all new signups)

## Troubleshooting

### "Unauthorized" Error on /admin

**Problem**: Getting redirected or seeing "Unauthorized" message

**Solutions**:
1. Verify the user_role was inserted correctly:
   ```sql
   SELECT * FROM public.user_roles WHERE user_id = 'YOUR_USER_ID';
   ```
2. Make sure you're logged in (check `/auth`)
3. Log out and log back in to refresh the session
4. Check browser console for any errors

### Can't Access Admin Dashboard

**Problem**: Stuck on login page or redirect loop

**Solutions**:
1. Clear browser localStorage: `localStorage.clear()`
2. Check Supabase Auth URL configuration in settings
3. Verify Site URL and Redirect URLs are set correctly in Supabase

### Email Confirmation Required

During development, you may want to disable email confirmation:

1. Go to [Supabase Auth Settings](https://supabase.com/dashboard/project/apdxtdarwacdcuhvtaag/auth/providers)
2. Scroll to "Email Auth" section
3. Toggle off "Confirm email"

This allows immediate testing without waiting for confirmation emails.

## Security Best Practices

1. **Never hardcode admin credentials** - Always use the role-based system
2. **Rotate admin users regularly** - Remove inactive admin accounts
3. **Use strong passwords** - Minimum 12 characters with mixed case, numbers, symbols
4. **Enable 2FA** when available in Supabase Auth
5. **Audit admin actions** - Consider adding audit logging for sensitive operations
6. **Limit admin accounts** - Only grant admin access to trusted users

## Database Schema Reference

### user_roles table
```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, role)
);
```

### profiles table
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```
