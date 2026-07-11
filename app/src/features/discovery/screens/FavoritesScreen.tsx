import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { useFavorites } from '../../../api/favorites';
import { useProfiles } from '../../../api/users';
import { useUser } from '../../../context/UserContext';
import ProfileCard from '../../../components/ProfileCard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../../../navigation/AppNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Favorites'>,
  NativeStackScreenProps<RootStackParamList>
>;

const FavoritesScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { role } = useUser();
  const { data: favoritesData = [], isLoading } = useFavorites();
  const { data: profiles = [] } = useProfiles();
  
  const favorites = favoritesData.map(fav => profiles.find(p => String(p.id) === String(fav.id)) || fav);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.count}>{favorites.length} people saved</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 92 }]}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews
        renderItem={({ item }) => (
          <ProfileCard
            profile={item}
            variant="list"
            isFavorite
            role={role}
            onPress={() => navigation.navigate('Profile', { id: item.id })}
            onCall={() => {
              if (!item.packageName) return Alert.alert('Unavailable', 'Admin has not assigned a call package to this profile yet.');
              navigation.navigate('Call', { id: item.id });
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    ...Typography.h3,
    color: Colors.foreground,
    marginBottom: 4,
  },
  count: {
    ...Typography.small,
    color: Colors.mutedForeground,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
});

export default FavoritesScreen;
