import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius } from '../../../theme/spacing';
import { useChats } from '../../../api/chat';
import { useUser } from '../../../context/UserContext';
import OnlineIndicator from '../../../components/OnlineIndicator';
import LinearGradient from 'react-native-linear-gradient';
import { Gradients } from '../../../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../../../navigation/AppNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlertStore } from '../../../hooks/useAlertStore';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Chats'>,
  NativeStackScreenProps<RootStackParamList>
>;

const ChatListScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { currentUser, role } = useUser();
  const [search, setSearch] = useState('');
  const { data: chats = [], isLoading } = useChats();

  const handleOpenChat = (chatId: string) => {
    if (!currentUser?.isVerified) {
      return useAlertStore.getState().show('Not Verified', 'Admin has not verified your profile yet.');
    }
    navigation.navigate('Conversation', { id: chatId });
  };

  const filtered = chats.filter(c =>
    c.user.name.toLowerCase().includes(search.toLowerCase())
  );
  const onlineUsers = chats.filter(c => c.user.isOnline);

  const SearchIcon = () => (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke={Colors.mutedForeground}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Circle cx={11} cy={11} r={8} />
      <Path d="m21 21-4.3-4.3" />
    </Svg>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Chats</Text>
        <View style={styles.searchBox}>
          <SearchIcon />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search conversations"
            placeholderTextColor={Colors.mutedForeground}
            style={styles.searchInput}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 92 }]}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
        ListHeaderComponent={
          <>
            {/* Online Now */}
            <Text style={styles.sectionLabel}>ONLINE NOW</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.onlineScroll}
              contentContainerStyle={styles.onlineContent}>
              {onlineUsers.map(c => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => handleOpenChat(c.id)}
                  style={styles.onlineItem}>
                  <View>
                    <Image source={{ uri: c.user.avatar }} style={styles.onlineAvatar} />
                    <View style={styles.onlineIndicator}>
                      <OnlineIndicator isOnline size="sm" />
                    </View>
                  </View>
                  <Text style={styles.onlineName} numberOfLines={1}>
                    {c.user.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>MESSAGES</Text>
          </>
        }
        renderItem={({ item: chat }) => {
          const time = new Date(chat.lastMessage.timestamp);
          const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <TouchableOpacity
              onPress={() => handleOpenChat(chat.id)}
              style={styles.chatRow}
              activeOpacity={0.7}>
              <View>
                <Image source={{ uri: chat.user.avatar }} style={styles.chatAvatar} />
                <View style={styles.chatIndicator}>
                  <OnlineIndicator isOnline={chat.user.isOnline} size="sm" />
                </View>
              </View>
              <View style={styles.chatInfo}>
                <View style={styles.chatTopRow}>
                  <Text style={styles.chatName}>{chat.user.name}</Text>
                  <Text style={styles.chatTime}>{timeStr}</Text>
                </View>
                <Text style={styles.chatLastMsg} numberOfLines={1}>
                  {chat.lastMessage.text}
                </Text>
              </View>
              {chat.unreadCount > 0 && (
                <LinearGradient
                  colors={[...Gradients.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{chat.unreadCount}</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          );
        }}
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
    marginBottom: 12,
  },
  searchBox: {
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
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.mutedForeground,
    marginBottom: 12,
  },
  onlineScroll: {
    marginBottom: 8,
  },
  onlineContent: {
    gap: 12,
    paddingRight: 16,
  },
  onlineItem: {
    alignItems: 'center',
    gap: 4,
    width: 60,
  },
  onlineAvatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.xl,
    backgroundColor: Colors.muted,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  onlineName: {
    ...Typography.caption,
    color: Colors.foreground,
    textAlign: 'center',
    width: 56,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: Radius.lg,
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.xl,
    backgroundColor: Colors.muted,
  },
  chatIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  chatInfo: {
    flex: 1,
  },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    ...Typography.bodySemibold,
    color: Colors.foreground,
  },
  chatTime: {
    ...Typography.caption,
    color: Colors.mutedForeground,
  },
  chatLastMsg: {
    ...Typography.small,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default ChatListScreen;
