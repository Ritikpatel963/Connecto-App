import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useUser } from '../context/UserContext';
import { DiscoveryScreen, FavoritesScreen } from '../features/discovery/screens';
import { ChatListScreen } from '../features/chat/screens';
import { WalletScreen } from '../features/wallet/screens';
import { SettingsScreen } from '../features/profile/screens';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

type TabIconProps = {
  routeName: keyof TabParamList;
  color: string;
  size?: number;
};

const TabIcon = ({ routeName, color, size = 22 }: TabIconProps) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (routeName) {
    case 'Discover':
      return (
        <Svg {...commonProps}>
          <Path d="M3 10.5L12 3l9 7.5" />
          <Path d="M5 9.5V21h14V9.5" />
        </Svg>
      );
    case 'Chats':
      return (
        <Svg {...commonProps}>
          <Path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H5l-2 2v-6.5A8.5 8.5 0 1 1 21 12Z" />
        </Svg>
      );
    case 'Wallet':
      return (
        <Svg {...commonProps}>
          <Rect x="3" y="6" width="18" height="12" rx="2" ry="2" />
          <Path d="M16 12h5" />
          <Circle cx="16" cy="12" r="1" fill={color} stroke="none" />
        </Svg>
      );
    case 'Favorites':
      return (
        <Svg {...commonProps}>
          <Path d="M12 20.5S4 15.7 4 9.8A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8 3.8c0 5.9-8 10.7-8 10.7Z" />
        </Svg>
      );
    case 'Settings':
      return (
        <Svg {...commonProps}>
          <Circle cx="12" cy="8" r="3.2" />
          <Path d="M5 20a7 7 0 0 1 14 0" />
        </Svg>
      );
    default:
      return null;
  }
};

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const { role } = useUser();
  const insets = useSafeAreaInsets();
  const activeColor = role === 'girl' ? Colors.girl : Colors.primary;

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}>
      {state.routes.map((route, index) => {
        const routeName = route.name as keyof TabParamList;
        const isFocused = state.index === index;
        const onPress = () => {
          if (!isFocused) {
            navigation.navigate(routeName);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}>
            <TabIcon
              routeName={routeName}
              color={isFocused ? activeColor : Colors.mutedForeground}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused ? activeColor : Colors.mutedForeground,
                  fontWeight: isFocused ? '700' : '500',
                },
              ]}>
              {routeName === 'Favorites'
                ? 'Favs'
                : routeName === 'Settings'
                ? 'Profile'
                : routeName}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const AppTabs = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{
      headerShown: false,
      lazy: true,
      freezeOnBlur: true,
    }}>
    <Tab.Screen name="Discover" component={DiscoveryScreen} />
    <Tab.Screen name="Chats" component={ChatListScreen} />
    <Tab.Screen name="Wallet" component={WalletScreen} />
    <Tab.Screen name="Favorites" component={FavoritesScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    paddingBottom: 28,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  tabLabel: {
    ...Typography.caption,
  },
});

export default AppTabs;
