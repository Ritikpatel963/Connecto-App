import { create } from 'zustand';

export interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  buttons?: Array<{ text: string; style?: 'cancel' | 'destructive' | 'default'; onPress?: () => void }>;
  show: (title: string, message: string, buttons?: Array<{ text: string; style?: 'cancel' | 'destructive' | 'default'; onPress?: () => void }>) => void;
  hide: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  visible: false,
  title: '',
  message: '',
  buttons: undefined,
  show: (title, message, buttons) => set({ visible: true, title, message, buttons }),
  hide: () => set({ visible: false, title: '', message: '', buttons: undefined }),
}));
