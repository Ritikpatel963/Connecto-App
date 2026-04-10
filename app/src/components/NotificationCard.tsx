import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Radius } from '../theme/spacing';
import type { Notification } from '../shared/types/app';

const colorMap: Record<string, { bg: string; fg: string }> = {
  call: { bg: 'rgba(255,92,92,0.1)', fg: Colors.primary },
  chat: { bg: 'rgba(107,159,255,0.1)', fg: Colors.boy },
  wallet: { bg: 'rgba(45,212,168,0.1)', fg: Colors.accent },
  referral: { bg: 'rgba(245,166,35,0.1)', fg: Colors.secondary },
  system: { bg: Colors.muted, fg: Colors.mutedForeground },
};

const iconMap: Record<string, string> = {
  call: '📞',
  chat: '💬',
  wallet: '💰',
  referral: '🎁',
  system: '🔔',
};

function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const NotificationCard: React.FC<{ notification: Notification }> = ({ notification }) => {
  const colors = colorMap[notification.type] || colorMap.system;
  const timeAgo = getTimeAgo(notification.timestamp);

  return (
    <View style={[styles.card, !notification.isRead && styles.unread]}>
      {notification.avatar ? (
        <Image source={{ uri: notification.avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.iconBox, { backgroundColor: colors.bg }]}>
          <Text style={{ fontSize: 18 }}>{iconMap[notification.type]}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.body}>{notification.body}</Text>
        <Text style={styles.time}>{timeAgo}</Text>
      </View>
      {!notification.isRead && <View style={styles.unreadDot} />}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: Radius.xl,
  },
  unread: {
    backgroundColor: Colors.card,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    ...Typography.bodySemibold,
    color: Colors.foreground,
  },
  body: {
    ...Typography.small,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  time: {
    ...Typography.caption,
    color: Colors.mutedForeground,
    opacity: 0.6,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 8,
  },
});

export default NotificationCard;
