# Firestore Security Rules - Troubleshooting Guide

## Error: "Missing or insufficient permissions"

This error occurs when your Firestore security rules don't allow the operation you're trying to perform.

---

## Quick Fix Steps

### 1. Update Firestore Security Rules

Go to Firebase Console → Firestore Database → Rules, and use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection
    match /users/{userId} {
      // Read own user data
      allow read: if request.auth != null && request.auth.uid == userId;

      // Create own user document
      allow create: if request.auth != null && request.auth.uid == userId;

      // Update own profile (but not role)
      allow update: if request.auth != null
                    && request.auth.uid == userId
                    && request.resource.data.role == resource.data.role;

      // Admins can update any user
      allow update: if request.auth != null
                    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Games collection
    match /games/{gameId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
                            && (request.auth.uid == resource.data.authorId
                            || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['moderator', 'admin']);
    }

    // Sessions collection
    match /sessions/{sessionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
                            && (request.auth.uid == resource.data.hostId
                            || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['moderator', 'admin']);
    }

    // Reviews collection
    match /reviews/{reviewId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
                            && (request.auth.uid == resource.data.userId
                            || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['moderator', 'admin']);
    }
  }
}
```

---

### 2. For Existing Users (Migration)

If you already have registered users BEFORE adding the role system, you need to add the `role` field to existing user documents:

#### Option A: Manually in Firebase Console

1. Go to Firestore Database
2. Open `users` collection
3. For each user document:
   - Click "Add field"
   - Field name: `role`
   - Field value: `user` (or `moderator`/`admin` as needed)
   - Click "Add"

#### Option B: Run a Migration Script

Create a one-time script to update all existing users:

```typescript
// migration-script.ts
import { db } from './src/services/firebase/config';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

async function migrateExistingUsers() {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);

  const updates = snapshot.docs.map(async (userDoc) => {
    const data = userDoc.data();

    // Only update if role doesn't exist
    if (!data.role) {
      await updateDoc(doc(db, 'users', userDoc.id), {
        role: 'user'
      });
      console.log(`Updated user ${userDoc.id} with default role`);
    }
  });

  await Promise.all(updates);
  console.log('Migration complete!');
}

// Run this once
migrateExistingUsers();
```

---

### 3. Test Your Rules

Use the Firebase Console Rules Playground:

1. Go to Firestore Database → Rules
2. Click "Rules playground" tab
3. Test scenarios:

**Test Read (should succeed):**
```
Location: /users/{actual-user-id}
Authenticated: Yes (use actual UID)
Operation: Read
```

**Test Read Other User (should fail):**
```
Location: /users/different-user-id
Authenticated: Yes (use different UID)
Operation: Read
```

---

## Common Issues

### Issue 1: "role is not defined" in rules

**Error in Firebase Console:**
```
Property role is undefined on object
```

**Solution:**
This happens when trying to read a user's role but the user document doesn't have a `role` field yet.

Add a check in your rules:
```javascript
allow delete: if request.auth != null
              && (request.auth.uid == resource.data.authorId
              || (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role != null
                  && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['moderator', 'admin']));
```

---

### Issue 2: Infinite Loading After Login

**Symptom:** App shows loading spinner forever after login

**Causes:**
1. User document doesn't exist in Firestore
2. Firestore rules blocking read access
3. Network error

**Solution:**
Check browser console for errors. If you see permission errors:
- Update Firestore rules (see above)
- Verify user document exists in `users` collection
- Log out and log back in

---

### Issue 3: Cannot Update User Role

**Symptom:** Admin cannot update user roles even with correct rules

**Cause:** Admin's own user document doesn't have `role: 'admin'`

**Solution:**
1. Go to Firestore Console
2. Find your user document in `users` collection
3. Manually set `role` to `'admin'`
4. Log out and log back in

---

## Development vs Production Rules

### Development (Permissive)

For testing, you can use more permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all authenticated users to read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **WARNING:** Never use this in production!

---

### Production (Strict)

Use the detailed rules provided at the top of this document.

---

## Debugging Rules

### Enable Firestore Debug Mode

In your browser console:
```javascript
// Enable Firestore logging
firebase.firestore.setLogLevel('debug');
```

### Check Rules Evaluation

Look for lines like:
```
Rules evaluation: ALLOW/DENY
Rule path: /users/{userId}
```

---

## Best Practices

1. **Always authenticate before accessing Firestore**
   - Check `request.auth != null` in all rules

2. **Validate data on write**
   ```javascript
   allow create: if request.auth != null
                 && request.resource.data.keys().hasAll(['uid', 'email', 'role'])
                 && request.resource.data.role == 'user'; // Force default role
   ```

3. **Use functions for complex logic**
   ```javascript
   function isAdmin() {
     return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
   }

   allow delete: if isAdmin();
   ```

4. **Test rules before deploying**
   - Use Rules Playground in Firebase Console
   - Write unit tests for rules

---

## Need More Help?

If you're still having issues:

1. Check browser console for specific error messages
2. Check Firebase Console → Firestore → Usage tab for denied requests
3. Review the rules evaluation in Firestore logs
4. Make sure your Firebase project billing is enabled (required for some operations)

---

## Summary

✅ Update Firestore security rules to allow user data access
✅ Migrate existing users to have `role` field
✅ Test rules in Firebase Console playground
✅ Use strict rules in production, permissive only in development