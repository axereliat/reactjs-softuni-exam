# Role-Based Route Protection Guide

This guide explains how to protect routes based on user roles in your React application.

## Table of Contents
1. [Overview](#overview)
2. [Available Roles](#available-roles)
3. [How It Works](#how-it-works)
4. [Usage Examples](#usage-examples)
5. [Managing User Roles](#managing-user-roles)
6. [Component API](#component-api)
7. [Best Practices](#best-practices)

---

## Overview

The application now supports role-based access control (RBAC) to restrict certain routes to users with specific roles. This is implemented using:

- **UserRole Type** - Defines available roles (`'user'`, `'moderator'`, `'admin'`)
- **Extended User Model** - User data stored in Firestore with role field
- **RoleBasedRoute Component** - Guards routes based on user role
- **Updated AuthContext** - Fetches and provides user role from Firestore

---

## Available Roles

```typescript
type UserRole = 'user' | 'moderator' | 'admin';
```

| Role | Description | Typical Access |
|------|-------------|----------------|
| **user** | Default role for all registered users | Standard features (create games, join sessions, write reviews) |
| **moderator** | Trusted users with moderation capabilities | User features + moderation (edit/delete content, manage sessions) |
| **admin** | Full system access | All features + user management, system settings |

**Default Role:** All new registrations automatically get the `'user'` role.

---

## How It Works

### 1. User Registration Flow

```
User Registers
  ↓
Firebase Auth creates account
  ↓
Firestore document created in 'users' collection
  ├── uid
  ├── email
  ├── displayName
  ├── role: 'user' (default)
  └── createdAt
  ↓
AuthContext loads user data with role
```

### 2. User Login Flow

```
User Logs In
  ↓
Firebase Auth validates credentials
  ↓
AuthContext fetches user from Firestore
  ↓
User role loaded and stored in context
  ↓
Routes check role for access
```

### 3. Route Protection Flow

```
User navigates to protected route
  ↓
RoleBasedRoute component checks:
  ├── Is user authenticated? → No → Redirect to /login
  ├── Is role loaded? → No → Show loading spinner
  └── Is role in allowedRoles? → No → Show 403 Access Denied
                                → Yes → Render component
```

---

## Usage Examples

### Example 1: Admin-Only Route

```tsx
import { RoleBasedRoute } from './guards/RoleBasedRoute';
import { AdminDashboard } from './pages/Admin/AdminDashboard';

<Route
  path="/admin/dashboard"
  element={
    <RoleBasedRoute allowedRoles={['admin']}>
      <AdminDashboard />
    </RoleBasedRoute>
  }
/>
```

**Result:**
- ✅ Admin users can access
- ❌ Moderators see 403 error
- ❌ Regular users see 403 error

---

### Example 2: Moderator and Admin Route

```tsx
import { RoleBasedRoute } from './guards/RoleBasedRoute';
import { ModerationPanel } from './pages/Moderation/ModerationPanel';

<Route
  path="/moderation"
  element={
    <RoleBasedRoute allowedRoles={['admin', 'moderator']}>
      <ModerationPanel />
    </RoleBasedRoute>
  }
/>
```

**Result:**
- ✅ Admin users can access
- ✅ Moderators can access
- ❌ Regular users see 403 error

---

### Example 3: All Authenticated Users

```tsx
import { RoleBasedRoute } from './guards/RoleBasedRoute';
import { CreateGame } from './pages/Games/CreateGame';

<Route
  path="/games/create"
  element={
    <RoleBasedRoute allowedRoles={['user', 'moderator', 'admin']}>
      <CreateGame />
    </RoleBasedRoute>
  }
/>
```

**Result:**
- ✅ All authenticated users can access
- ❌ Unauthenticated users redirected to login

**Note:** This is functionally equivalent to `<PrivateRoute>` but with explicit role checking.

---

### Example 4: Custom Redirect on Access Denied

```tsx
import { RoleBasedRoute } from './guards/RoleBasedRoute';
import { AdminSettings } from './pages/Admin/AdminSettings';

<Route
  path="/admin/settings"
  element={
    <RoleBasedRoute allowedRoles={['admin']} redirectTo="/dashboard">
      <AdminSettings />
    </RoleBasedRoute>
  }
/>
```

**Result:**
- If access is denied, user is redirected to `/dashboard` instead of showing the 403 page

---

### Example 5: Conditional UI Based on Role

In your components, you can access the user's role to show/hide features:

```tsx
import { useAuth } from '../contexts/AuthContext';

function GameDetails() {
  const { userRole, userData } = useAuth();

  return (
    <div>
      <h1>Game Details</h1>

      {/* Show delete button only to moderators and admins */}
      {(userRole === 'moderator' || userRole === 'admin') && (
        <Button danger onClick={handleDelete}>
          Delete Game
        </Button>
      )}

      {/* Show admin panel only to admins */}
      {userRole === 'admin' && (
        <AdminPanel />
      )}

      {/* Show different content based on role */}
      {userRole === 'user' && <p>Enjoying the game? Leave a review!</p>}
      {userRole === 'moderator' && <p>Remember to moderate reviews.</p>}
      {userRole === 'admin' && <p>You have full system access.</p>}
    </div>
  );
}
```

---

## Managing User Roles

### Checking User's Current Role

```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { userRole, userData } = useAuth();

  console.log('Current role:', userRole); // 'user', 'moderator', or 'admin'
  console.log('Full user data:', userData);

  return <div>Your role: {userRole}</div>;
}
```

---

### Updating a User's Role (Admin Function)

To change a user's role, you need to:

1. **Manually update in Firestore Console** (simplest for now)
   - Go to Firebase Console → Firestore Database
   - Navigate to `users` collection
   - Find the user document by UID
   - Edit the `role` field to `'moderator'` or `'admin'`
   - User will get new permissions on next login

2. **Create an Admin Panel** (recommended for production)

```tsx
// Example admin component
import { userService } from '../services/api/userService';

function UserManagement() {
  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    try {
      await userService.updateUserRole(uid, newRole);
      message.success('User role updated successfully');
    } catch (error) {
      message.error('Failed to update user role');
    }
  };

  return (
    <Select
      onChange={(value) => handleRoleChange(userId, value as UserRole)}
      defaultValue={currentRole}
    >
      <Select.Option value="user">User</Select.Option>
      <Select.Option value="moderator">Moderator</Select.Option>
      <Select.Option value="admin">Admin</Select.Option>
    </Select>
  );
}
```

---

## Component API

### RoleBasedRoute Props

```typescript
interface RoleBasedRouteProps {
  children: ReactNode;           // The component to render if authorized
  allowedRoles: UserRole[];      // Array of roles that can access this route
  redirectTo?: string;           // Optional: Where to redirect if unauthorized (default: '/')
}
```

**Properties:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | ReactNode | ✅ Yes | - | Component to render if user has required role |
| `allowedRoles` | UserRole[] | ✅ Yes | - | Array of roles allowed to access this route |
| `redirectTo` | string | ❌ No | `'/'` | Where to redirect on access denial |

---

### AuthContext API Updates

The `useAuth()` hook now provides additional fields:

```typescript
const {
  currentUser,    // Firebase auth user (email, uid, etc.)
  userData,       // Full user data from Firestore (includes role)
  userRole,       // User's role: 'user' | 'moderator' | 'admin' | null
  loading,        // Boolean: true while checking auth state
  register,       // Function to register new user
  login,          // Function to log in
  logout,         // Function to log out
} = useAuth();
```

**New Fields:**
- `userData` - Full user object from Firestore (type: `User | null`)
- `userRole` - Quick access to user's role (type: `UserRole | null`)

---

## Best Practices

### 1. Always Use Role Arrays

Even for single roles, use arrays for consistency and future flexibility:

```tsx
// ✅ Good
<RoleBasedRoute allowedRoles={['admin']}>

// ❌ Bad (won't work)
<RoleBasedRoute allowedRoles="admin">
```

---

### 2. Combine with PrivateRoute for Basic Auth

For routes that don't need role checking, continue using `<PrivateRoute>`:

```tsx
// Use PrivateRoute for basic authentication
<Route
  path="/profile"
  element={
    <PrivateRoute>
      <Profile />
    </PrivateRoute>
  }
/>

// Use RoleBasedRoute for role-specific access
<Route
  path="/admin/settings"
  element={
    <RoleBasedRoute allowedRoles={['admin']}>
      <AdminSettings />
    </RoleBasedRoute>
  }
/>
```

---

### 3. Protect Backend Operations Too

**Important:** Frontend route protection is for UX only. Always validate roles on the backend!

```typescript
// Example: Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Allow users to read their own data
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId
                   && request.resource.data.role == resource.data.role; // Prevent role self-update
    }

    // Only admins can update user roles
    match /users/{userId} {
      allow update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Games can be deleted by author, moderators, or admins
    match /games/{gameId} {
      allow delete: if request.auth.uid == resource.data.authorId
                    || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['moderator', 'admin'];
    }
  }
}
```

---

### 4. Show Appropriate UI Based on Role

Don't just hide routes—hide UI elements too:

```tsx
import { useAuth } from '../contexts/AuthContext';

function Navigation() {
  const { userRole } = useAuth();

  return (
    <Menu>
      <Menu.Item key="home">Home</Menu.Item>
      <Menu.Item key="games">Games</Menu.Item>

      {/* Show moderation link only to moderators and admins */}
      {(userRole === 'moderator' || userRole === 'admin') && (
        <Menu.Item key="moderation">Moderation</Menu.Item>
      )}

      {/* Show admin link only to admins */}
      {userRole === 'admin' && (
        <Menu.Item key="admin">Admin Panel</Menu.Item>
      )}
    </Menu>
  );
}
```

---

### 5. Handle Loading States

Always check if `userRole` is loaded before making role-based decisions:

```tsx
const { userRole, loading } = useAuth();

if (loading) {
  return <Spin />;
}

if (!userRole) {
  return <div>Error loading user permissions</div>;
}

// Now safe to check role
if (userRole === 'admin') {
  // ...
}
```

---

## Firestore Database Structure

### Users Collection

```
users (collection)
  └── {userId} (document)
      ├── uid: string
      ├── email: string
      ├── displayName: string
      ├── photoURL?: string
      ├── role: 'user' | 'moderator' | 'admin'
      └── createdAt: Timestamp
```

**Example Document:**
```json
{
  "uid": "abc123xyz",
  "email": "user@example.com",
  "displayName": "John Doe",
  "role": "user",
  "createdAt": "2025-12-07T10:30:00Z"
}
```

---

## Common Issues & Troubleshooting

### Issue 1: User Role Not Loading

**Symptom:** Infinite loading spinner or `userRole` is always `null`

**Solution:**
- Check that the user document exists in Firestore `users` collection
- Verify the document has a `role` field
- Check browser console for errors
- Ensure Firestore security rules allow reading user documents

---

### Issue 2: Access Denied for Valid Role

**Symptom:** User with correct role sees 403 page

**Solution:**
- Check that `allowedRoles` array includes the user's role
- Verify role is spelled correctly (case-sensitive)
- Check browser console: `console.log(userRole)` to see actual value

---

### Issue 3: Role Not Updating After Change

**Symptom:** Changed role in Firestore but user still has old permissions

**Solution:**
- User needs to log out and log back in to refresh role
- Alternatively, add a "refresh permissions" button that re-fetches user data

---

## Security Considerations

1. **Frontend protection is not security** - Always enforce rules on the backend (Firestore Security Rules)
2. **Don't trust client-side role checks** - Validate roles in Firestore rules for all operations
3. **Use HTTPS** - Always use secure connections in production
4. **Audit role changes** - Log when user roles are modified
5. **Principle of least privilege** - Give users only the minimum role they need

---

## Summary

You now have a complete role-based access control system:

✅ Three user roles: `user`, `moderator`, `admin`
✅ `RoleBasedRoute` component for protecting routes
✅ Extended `AuthContext` with role information
✅ User data stored in Firestore with roles
✅ Examples and best practices

To use it:
1. Import `RoleBasedRoute` in your routing file
2. Wrap protected routes with `<RoleBasedRoute allowedRoles={[...]}>`
3. Access `userRole` from `useAuth()` to show conditional UI
4. Manage roles via Firestore console or admin panel