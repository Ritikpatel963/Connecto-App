# Connecto - React Native (Bare CLI)

A production-ready social voice-calling app built with bare React Native CLI + TypeScript.

## Requirements

- Node.js 18+
- React Native CLI
- Xcode 15+ (iOS)
- Android Studio (Android)
- Ruby 3+ & CocoaPods (iOS)

## Quick Start

```bash
# 1. Create project
npx @react-native-community/cli init Connecto --template react-native-template-typescript

# 2. Copy all files from src/ into your project's src/ folder
# Copy App.tsx to the root

# 3. Install dependencies
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs \
  react-native-screens react-native-safe-area-context react-native-gesture-handler \
  react-native-reanimated react-native-vector-icons @react-native-async-storage/async-storage \
  react-native-linear-gradient react-native-svg

# 4. iOS only
cd ios && pod install && cd ..

# 5. Run
npx react-native run-ios
# or
npx react-native run-android
```

## React Native Version

This project targets **React Native 0.76+** (latest stable as of 2026).

## Project Structure

```
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
│   └── UserContext.tsx     # Global user state (role, wallet, auth)
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

## Design System

- **Dark theme** with HSL-based color tokens
- **Role-based accents**: Boy (blue), Girl (pink)
- **Gradients**: Primary (red→orange), Boy (blue→cyan), Girl (pink→red)
- **Typography**: System font with 8-level scale
- **Spacing**: 4px grid system
- **Border radius**: Consistent rounded corners (sm/md/lg/xl/2xl/3xl/full)

## Features

- OTP Login flow
- Boy/Girl role selection
- 3-screen onboarding with privacy policy
- Discovery feed with search & filters
- Full profile view with stats
- Voice call UI (ringing → active → ended with rating)
- Chat list with online users carousel
- Text + emoji only conversation (no attachments)
- Wallet with balance, recharge, transactions
- Favorites list
- Notifications
- Referral program with milestones
- Settings with logout
