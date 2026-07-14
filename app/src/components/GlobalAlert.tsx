import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAlertStore } from '../hooks/useAlertStore';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Radius, Elevation } from '../theme/spacing';
import LinearGradient from 'react-native-linear-gradient';
import { Gradients } from '../theme/colors';

export const GlobalAlert = () => {
  const { visible, title, message, buttons, hide } = useAlertStore();

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            {buttons && buttons.length > 0 ? (
              buttons.map((btn, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    hide();
                    if (btn.onPress) btn.onPress();
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.button,
                    btn.style === 'cancel' && { backgroundColor: Colors.muted, marginTop: 8 },
                    btn.style === 'destructive' && { backgroundColor: 'rgba(239,68,68,0.1)', marginTop: 8 },
                  ]}
                >
                  {btn.style !== 'cancel' && btn.style !== 'destructive' ? (
                    <LinearGradient
                      colors={[...Gradients.primary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientBtn}
                    >
                      <Text style={styles.buttonText}>{btn.text}</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={[
                      styles.buttonText,
                      btn.style === 'cancel' && { color: Colors.foreground },
                      btn.style === 'destructive' && { color: Colors.destructive },
                    ]}>{btn.text}</Text>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity onPress={hide} activeOpacity={0.8}>
                <LinearGradient
                  colors={[...Gradients.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.button, styles.gradientBtn]}
                >
                  <Text style={styles.buttonText}>OK</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertBox: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: 24,
    alignItems: 'center',
    ...Elevation.medium,
  },
  title: {
    ...Typography.h4,
    color: Colors.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    color: Colors.mutedForeground,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 8,
  },
  button: {
    width: '100%',
    borderRadius: Radius.lg,
    alignItems: 'center',
    paddingVertical: 14,
  },
  gradientBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  buttonText: {
    ...Typography.buttonLarge,
    color: '#FFF',
  },
});
