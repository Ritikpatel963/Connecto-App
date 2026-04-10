import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Radius } from '../theme/spacing';
import type { ChatMessage } from '../shared/types/app';
import LinearGradient from 'react-native-linear-gradient';
import { Gradients } from '../theme/colors';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwn }) => {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const bubbleContent = (
    <>
      <Text style={[styles.text, isOwn && styles.ownText]}>{message.text}</Text>
      <Text style={[styles.time, isOwn && styles.ownTime]}>
        {time} {isOwn && (message.isRead ? '✓✓' : '✓')}
      </Text>
    </>
  );

  return (
    <View style={[styles.row, isOwn && styles.rowOwn]}>
      {isOwn ? (
        <LinearGradient
          colors={[...Gradients.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.ownBubble]}>
          {bubbleContent}
        </LinearGradient>
      ) : (
        <View style={[styles.bubble, styles.otherBubble]}>{bubbleContent}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  rowOwn: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ownBubble: {
    borderRadius: Radius.xl,
    borderBottomRightRadius: Radius.sm,
  },
  otherBubble: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderBottomLeftRadius: Radius.sm,
  },
  text: {
    ...Typography.body,
    color: Colors.foreground,
  },
  ownText: {
    color: '#FFFFFF',
  },
  time: {
    ...Typography.caption,
    color: Colors.mutedForeground,
    opacity: 0.6,
    textAlign: 'right',
    marginTop: 4,
  },
  ownTime: {
    color: 'rgba(255,255,255,0.5)',
  },
});

export default ChatBubble;
