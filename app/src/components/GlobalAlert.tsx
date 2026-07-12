import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAlertStore } from '../hooks/useAlertStore';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Radius, Elevation } from '../theme/spacing';
import LinearGradient from 'react-native-linear-gradient';
import { Gradients } from '../theme/colors';

export const GlobalAlert = () => {
  const { visible, title, message, hide } = useAlertStore();

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity onPress={hide} activeOpacity={0.8} style={styles.buttonContainer}>
            <LinearGradient
              colors={[...Gradients.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>OK</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  },
  button: {
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
