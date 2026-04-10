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
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius } from '../../../theme/spacing';
import { mockChats } from '../../../shared/data/mockData';
import ChatBubble from '../../../components/ChatBubble';
import OnlineIndicator from '../../../components/OnlineIndicator';
import type { ChatMessage } from '../../../shared/types/app';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Conversation'>;

const ConversationScreen: React.FC<Props> = ({ navigation, route }) => {
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 18, color: Colors.foreground }}>←</Text>
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
            <Text style={{ fontSize: 14 }}>📞</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <ChatBubble message={item} isOwn={item.senderId === 'me'} />
        )}
      />

      {/* Input - text + emoji only */}
      <View style={styles.inputBar}>
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
            <Text style={{ fontSize: 18 }}>😊</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleSend} activeOpacity={0.8}>
          <LinearGradient
            colors={[...Gradients.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendBtn}>
            <Text style={{ fontSize: 14, color: '#FFF' }}>➤</Text>
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
    paddingVertical: 12,
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
