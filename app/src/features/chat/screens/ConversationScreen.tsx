import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius } from '../../../theme/spacing';
import { mockChats } from '../../../shared/data/mockData';
import ChatBubble from '../../../components/ChatBubble';
import OnlineIndicator from '../../../components/OnlineIndicator';
import BackArrowIcon from '../../../components/BackArrowIcon';
import type { ChatMessage } from '../../../shared/types/app';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Conversation'>;

type IconProps = {
  color?: string;
  size?: number;
};

const CHAT_CALL_ICON_SIZE = 14;
const CHAT_EMOJI_ICON_SIZE = 18;
const CHAT_SEND_ICON_SIZE = 16;

const PhoneIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = CHAT_CALL_ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
);

const SmileIcon: React.FC<IconProps> = ({ color = Colors.mutedForeground, size = CHAT_EMOJI_ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Circle cx={12} cy={12} r={10} />
    <Path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <Line x1={9} x2={9.01} y1={9} y2={9} />
    <Line x1={15} x2={15.01} y1={9} y2={9} />
  </Svg>
);

const SendIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = CHAT_SEND_ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
    <Path d="m21.854 2.147-10.94 10.939" />
  </Svg>
);

const ConversationScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  const chat = mockChats.find(c => c.id === id);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'm1', senderId: chat?.user.id || '', text: 'Hey! How are you doing? 😊', timestamp: new Date(Date.now() - 300000).toISOString(), type: 'text', isRead: true },
    { id: 'm2', senderId: 'me', text: "I'm great! Would love to chat", timestamp: new Date(Date.now() - 240000).toISOString(), type: 'text', isRead: true },
    { id: 'm3', senderId: chat?.user.id || '', text: 'Sure! Call me anytime 💕', timestamp: new Date(Date.now() - 180000).toISOString(), type: 'text', isRead: true },
    { id: 'm4', senderId: 'me', text: 'How about a call later? 🎉', timestamp: new Date(Date.now() - 120000).toISOString(), type: 'text', isRead: true },
    { id: 'm5', senderId: chat?.user.id || '', text: 'That was sweet! 😄', timestamp: new Date(Date.now() - 60000).toISOString(), type: 'text', isRead: false },
  ]);

  if (!chat) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [
      ...prev,
      {
        id: `m${Date.now()}`,
        senderId: 'me',
        text: input,
        timestamp: new Date().toISOString(),
        type: 'text',
        isRead: false,
      },
    ]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackArrowIcon color={Colors.foreground} size={20} />
        </TouchableOpacity>
        <Image source={{ uri: chat.user.avatar }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{chat.user.name}</Text>
          <View style={styles.onlineRow}>
            <OnlineIndicator isOnline={chat.user.isOnline} size="sm" />
            <Text style={styles.onlineText}>
              {chat.user.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Call', { id: chat.user.id })}
          activeOpacity={0.8}>
          <LinearGradient
            colors={[...Gradients.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.callBtn}>
            <PhoneIcon />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.messageList, { paddingBottom: insets.bottom + 16 }]}
        renderItem={({ item }) => (
          <ChatBubble message={item} isOwn={item.senderId === 'me'} />
        )}
      />

      {/* Input - text + emoji only */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            placeholder="Type a message or emoji..."
            placeholderTextColor={Colors.mutedForeground}
            style={styles.textInput}
            returnKeyType="send"
          />
          <TouchableOpacity>
            <SmileIcon />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleSend} activeOpacity={0.8}>
          <LinearGradient
            colors={[...Gradients.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendBtn}>
            <SendIcon />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.lg,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    ...Typography.bodySemibold,
    color: Colors.foreground,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineText: {
    ...Typography.caption,
    color: Colors.mutedForeground,
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  inputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    color: Colors.foreground,
    ...Typography.body,
    padding: 0,
    marginRight: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ConversationScreen;
