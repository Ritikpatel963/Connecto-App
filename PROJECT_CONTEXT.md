# Project Architecture & Workflow Context

Use this document as a system prompt or context window when generating code patches for this project.

## 1. System Architecture

The project is divided into three distinct environments:

### Client App (`app/`)
- **Framework**: React Native (Bare CLI, v0.76+) with TypeScript.
- **State Management**: `@tanstack/react-query` for server state and data fetching, `zustand` for local app state.
- **Backend Connection**: Uses `@supabase/supabase-js` to directly query the database and handle auth. Relies heavily on Row Level Security (RLS).
- **Navigation**: `@react-navigation` (Native Stack + Bottom Tabs).

### Admin Dashboard (`admin/`)
- **Framework**: React web application.
- **Backend Connection**: Uses `axios` to fetch data from the custom Node backend. It **never** queries Supabase directly from the browser to protect administrative privileges.

### Backend API (`backend/admin-api/`)
- **Framework**: Bare Node.js `node:http` server. **Does not use Express.**
- **Admin Routes (`/api/admin`)**: Handles admin authentication, role checks, and audit logging. Connects to Supabase using the Service Role Key to bypass RLS for administrative tasks.
- **App Routes (`/api/app`)**: Handles operations requiring secrets that cannot be exposed to the React Native client (e.g., Razorpay order creation).
- **Realtime**: Initializes a `socket.io` server for bidirectional communication.

## 2. Coding Rules & Boundaries

When writing or fixing code, adhere to these strict boundaries:
1. **No Secrets in Client**: Never place API secret keys (Razorpay, Supabase Service Role) in the `app/` or `admin/` folders. They belong exclusively in `backend/`.
2. **Backend Syntax**: Do not use Express middleware or routing syntax (`app.get()`, `res.json()`). Use standard Node.js `http` module syntax (`req.method`, `res.end()`).
3. **Data Fetching**: Always use React Query (`useQuery`, `useMutation`) for API calls in the `app/` rather than standard `useEffect` + `fetch`.

## 3. Client App Directory Structure (`app/src/`)

```text
src/
├── theme/
│   ├── colors.ts          # Full color system (dark theme, role-based)
│   ├── typography.ts      # Font scale & weights
│   └── spacing.ts         # Spacing, radius, elevation
├── types/
│   └── app.ts             # All TypeScript interfaces
├── data/
│   └── mockData.ts        # Mock profiles, chats, transactions
├── context/
│   └── UserContext.tsx    # Global user state (role, wallet, auth)
├── navigation/
│   └── AppNavigator.tsx   # Stack + Bottom Tab navigation
├── components/
│   ├── ProfileCard.tsx    # Grid & list variants
│   ├── WalletCard.tsx     # Gradient wallet balance
│   ├── ChatBubble.tsx     # Message bubbles
│   ├── OnlineIndicator.tsx
│   ├── PremiumBadge.tsx
│   ├── RatingStars.tsx
│   ├── TransactionRow.tsx
│   ├── NotificationCard.tsx
│   ├── ReferralProgressBar.tsx
│   └── BottomTabBar.tsx   # Custom bottom tab bar
└── screens/
    ├── SplashScreen.tsx
    ├── OnboardingScreen.tsx
    ├── LoginScreen.tsx
    ├── RoleSelectScreen.tsx
    ├── ProfileSetupScreen.tsx
    ├── DiscoveryScreen.tsx
    ├── ProfileScreen.tsx
    ├── CallScreen.tsx
    ├── ChatListScreen.tsx
    ├── ConversationScreen.tsx
    ├── WalletScreen.tsx
    ├── FavoritesScreen.tsx
    ├── NotificationsScreen.tsx
    ├── ReferralScreen.tsx
    └── SettingsScreen.tsx
```

## 4. UI / UX Design Tokens

- **Theme Base**: Dark theme using HSL-based color tokens.
- **Role-based Accents**: 
  - Boy: Blue styling
  - Girl: Pink styling
- **Gradients**:
  - Primary: Red → Orange
  - Boy: Blue → Cyan
  - Girl: Pink → Red
- **Typography**: System font utilizing an 8-level scale.
- **Spacing**: Strict 4px grid system.
- **Border Radius**: Consistent rounded corners (sm / md / lg / xl / 2xl / 3xl / full).
