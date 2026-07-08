import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  PixelRatio,
  useWindowDimensions,
  ScrollView,
} from 'react-native';

const BASE_WIDTH = 932;

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'mission' | 'reward' | 'system' | 'alert';
}

function makeStyles(width: number) {
  const scaleFactor = width / BASE_WIDTH;
  const normalize = (size: number) =>
    Math.round(PixelRatio.roundToNearestPixel(size * scaleFactor));
  const bw = (size: number) => Math.max(1, normalize(size));

  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      height: '100%',
      backgroundColor: '#060e18',
    },
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: normalize(24),
      paddingTop: normalize(24),
      paddingBottom: normalize(16),
    },
    headerTitle: {
      color: '#ffffff',
      fontSize: normalize(24),
      fontFamily: 'PixelFont',
      textShadowColor: '#5ac8ff',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalize(8),
    },
    backButtonText: {
      color: '#7ab8d4',
      fontSize: normalize(14),
      fontFamily: 'PixelFont',
    },
    content: {
      flex: 1,
      paddingHorizontal: normalize(24),
    },
    notificationItem: {
      backgroundColor: 'rgba(18, 36, 58, 0.85)',
      borderWidth: bw(2),
      borderColor: '#3a6a8a',
      borderRadius: normalize(8),
      paddingHorizontal: normalize(16),
      paddingVertical: normalize(14),
      marginBottom: normalize(12),
    },
    notificationItemUnread: {
      borderColor: '#ffd23f',
      backgroundColor: 'rgba(255, 210, 63, 0.1)',
    },
    notificationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: normalize(8),
    },
    notificationTitle: {
      color: '#ffffff',
      fontSize: normalize(14),
      fontFamily: 'PixelFont',
      fontWeight: 'bold',
    },
    notificationTimestamp: {
      color: '#5a8aaa',
      fontSize: normalize(10),
      fontFamily: 'PixelFont',
    },
    notificationMessage: {
      color: '#7ab8d4',
      fontSize: normalize(12),
      fontFamily: 'PixelFont',
      marginBottom: normalize(12),
    },
    notificationActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: normalize(8),
    },
    actionButton: {
      paddingHorizontal: normalize(12),
      paddingVertical: normalize(6),
      borderRadius: normalize(6),
      borderWidth: bw(1),
    },
    markReadButton: {
      borderColor: '#3fbf7f',
      backgroundColor: 'rgba(63, 191, 127, 0.2)',
    },
    deleteButton: {
      borderColor: '#ff6363',
      backgroundColor: 'rgba(255, 99, 99, 0.2)',
    },
    actionButtonText: {
      fontSize: normalize(10),
      fontFamily: 'PixelFont',
      fontWeight: 'bold',
    },
    markReadButtonText: {
      color: '#3fbf7f',
    },
    deleteButtonText: {
      color: '#ff6363',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: normalize(60),
    },
    emptyStateText: {
      color: '#5a8aaa',
      fontSize: normalize(14),
      fontFamily: 'PixelFont',
      textAlign: 'center',
    },
    typeBadge: {
      paddingHorizontal: normalize(8),
      paddingVertical: normalize(2),
      borderRadius: normalize(4),
    },
    typeBadgeMission: {
      backgroundColor: '#5ac8ff',
    },
    typeBadgeReward: {
      backgroundColor: '#ffd23f',
    },
    typeBadgeSystem: {
      backgroundColor: '#3fbf7f',
    },
    typeBadgeAlert: {
      backgroundColor: '#ff6363',
    },
    typeBadgeText: {
      color: '#060e18',
      fontSize: normalize(8),
      fontFamily: 'PixelFont',
      fontWeight: 'bold',
    },
  });
}

export default function InboxScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const styles = makeStyles(width);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Mission Complete',
      message: 'You have successfully completed Stage 3! Rewards have been added to your inventory.',
      timestamp: '2 hours ago',
      read: false,
      type: 'mission',
    },
    {
      id: '2',
      title: 'New Reward Available',
      message: 'A new tower skin is now available in the Store. Check it out!',
      timestamp: '5 hours ago',
      read: false,
      type: 'reward',
    },
    {
      id: '3',
      title: 'System Update',
      message: 'Game servers will be undergoing maintenance tonight at 2:00 AM UTC.',
      timestamp: '1 day ago',
      read: true,
      type: 'system',
    },
    {
      id: '4',
      title: 'Security Alert',
      message: 'Unusual login activity detected. Please verify your account.',
      timestamp: '2 days ago',
      read: true,
      type: 'alert',
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'mission': return styles.typeBadgeMission;
      case 'reward': return styles.typeBadgeReward;
      case 'system': return styles.typeBadgeSystem;
      case 'alert': return styles.typeBadgeAlert;
      default: return styles.typeBadgeSystem;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>{'< BACK'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>INBOX</Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={[styles.backButtonText, { color: '#ffd23f' }]}>
                MARK ALL READ
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.content}>
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No notifications</Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <View
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.notificationItemUnread,
                ]}
              >
                <View style={styles.notificationHeader}>
                  <View style={styles.notificationHeader}>
                    <View style={[styles.typeBadge, getTypeColor(notification.type)]}>
                      <Text style={styles.typeBadgeText}>
                        {notification.type.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                  </View>
                  <Text style={styles.notificationTimestamp}>{notification.timestamp}</Text>
                </View>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <View style={styles.notificationActions}>
                  {!notification.read && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.markReadButton]}
                      onPress={() => markAsRead(notification.id)}
                    >
                      <Text style={[styles.actionButtonText, styles.markReadButtonText]}>
                        MARK READ
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => deleteNotification(notification.id)}
                  >
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                      DELETE
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
