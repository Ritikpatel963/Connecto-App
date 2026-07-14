import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

const SUPABASE_URL = ENV.SUPABASE_URL;
const SUPABASE_KEY = ENV.SUPABASE_KEY;

type Props = NativeStackScreenProps<RootStackParamList, 'Content'>;

import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { ENV } from '../../../config/env';

const ContentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { title, contentKey } = route.params;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/settings?key=eq.${contentKey}`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.length > 0) {
        setContent(data[0].value || 'Content not available yet.');
      } else {
        setContent('Content not available yet.');
      }
    })
    .catch(() => setContent('Failed to load content.'))
    .finally(() => setLoading(false));
  }, [contentKey]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 24, color: Colors.foreground }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : (
          <RenderHtml
            contentWidth={width - 48}
            source={{ html: content }}
            tagsStyles={{
              body: { color: Colors.foreground, fontSize: 16, lineHeight: 24 },
              p: { color: Colors.foreground, fontSize: 16, lineHeight: 24, marginBottom: 12 },
              h1: { color: Colors.foreground, marginTop: 16, marginBottom: 8 },
              h2: { color: Colors.foreground, marginTop: 16, marginBottom: 8 },
              h3: { color: Colors.foreground, marginTop: 16, marginBottom: 8 },
              li: { color: Colors.foreground, fontSize: 16, lineHeight: 24 },
            }}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { marginRight: 16 },
  title: { ...Typography.h3, color: Colors.foreground },
  content: { padding: 24 },
  textContent: { ...Typography.body, color: Colors.foreground, lineHeight: 24 }
});

export default ContentScreen;
