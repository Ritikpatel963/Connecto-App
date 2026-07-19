import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius } from '../../../theme/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const WaitApprovalScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <LinearGradient
          colors={[...Gradients.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}>
          <Text style={styles.icon}>⏳</Text>
        </LinearGradient>

        <Text style={styles.title}>Profile Under Review</Text>
        <Text style={styles.subtitle}>
          Your profile has been submitted successfully and is currently being reviewed by our team.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <View style={styles.step}>
            <View style={styles.dot} />
            <Text style={styles.stepText}>Our team will verify your documents</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.dot} />
            <Text style={styles.stepText}>You'll be notified once approved</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.dot} />
            <Text style={styles.stepText}>This usually takes 24-48 hours</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Thank you for your patience! 🙏
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    ...Typography.h2,
    color: Colors.foreground,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 32,
  },
  infoTitle: {
    ...Typography.bodySemibold,
    color: Colors.foreground,
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  stepText: {
    ...Typography.body,
    color: Colors.mutedForeground,
    flex: 1,
  },
  footer: {
    ...Typography.body,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
});

export default WaitApprovalScreen;
