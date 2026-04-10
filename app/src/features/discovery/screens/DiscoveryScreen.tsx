import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius } from '../../../theme/spacing';
import { mockProfiles } from '../../../shared/data/mockData';
import { useUser } from '../../../context/UserContext';
import ProfileCard from '../../../components/ProfileCard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../../../navigation/AppNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Discover'>,
  NativeStackScreenProps<RootStackParamList>
>;

const { width } = Dimensions.get('window');
const cardWidth = (width - 48 - 12) / 2;

const filters = ['All', 'Online', 'Premium', 'Verified', 'New'];

const DiscoveryScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { role } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState(0);

  const filtered = mockProfiles.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Discover</Text>
            <Text style={styles.subtitle}>
              {role === 'boy' ? 'Find someone to talk to' : 'Your audience awaits'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setShowSearch(!showSearch)}
              style={styles.headerBtn}>
              <Text style={{ fontSize: 16 }}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              style={styles.headerBtn}>
              <Text style={{ fontSize: 16 }}>🔔</Text>
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>

        {showSearch && (
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Text style={{ fontSize: 14 }}>🔍</Text>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by name..."
                placeholderTextColor={Colors.mutedForeground}
                style={styles.searchInput}
                autoFocus
              />
            </View>
            <TouchableOpacity style={styles.filterBtn}>
              <Text style={{ fontSize: 14 }}>⚙️</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
          {filters.map((filter, i) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(i)}
              activeOpacity={0.8}>
              {i === activeFilter ? (
                <LinearGradient
                  colors={[...Gradients.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.filterChip}>
                  <Text style={styles.filterTextActive}>{filter}</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.filterChip, styles.filterChipInactive]}>
                  <Text style={styles.filterTextInactive}>{filter}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Profile Grid */}
      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 92 }]}
        columnWrapperStyle={styles.gridRow}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        renderItem={({ item }) => (
          <View style={{ width: cardWidth }}>
            <ProfileCard
              profile={item}
              role={role}
              onPress={() => navigation.navigate('Profile', { id: item.id })}
              onCall={() => navigation.navigate('Call', { id: item.id })}
            />
          </View>
        )}
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
    backgroundColor: Colors.background,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    ...Typography.h3,
    color: Colors.foreground,
  },
  subtitle: {
    ...Typography.small,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.foreground,
    ...Typography.body,
    padding: 0,
  },
  filterBtn: {
    width: 40,
    height: 40,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersRow: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.lg,
    marginRight: 8,
  },
  filterChipInactive: {
    backgroundColor: Colors.card,
  },
  filterTextActive: {
    ...Typography.smallSemibold,
    color: '#FFFFFF',
  },
  filterTextInactive: {
    ...Typography.smallSemibold,
    color: Colors.mutedForeground,
  },
  grid: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  gridRow: {
    gap: 12,
    marginBottom: 12,
  },
});

export default DiscoveryScreen;
