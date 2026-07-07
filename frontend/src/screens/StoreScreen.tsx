import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
  PixelRatio,
  ImageBackground,
  FlatList,
  Modal,
} from 'react-native';
import { useProgressionStore } from '../store/useProgressionStore';

const { width, height } = Dimensions.get('window');
const BASE_WIDTH = 932;
const scaleFactor = width / BASE_WIDTH;
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * scaleFactor));
const bw = (size: number) => Math.max(1, normalize(size));

export default function StoreScreen({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState<'TRENDING'|'PROFILES'|'BORDERS'>('TRENDING');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState('');

  const threatPoints = useProgressionStore((state) => state.threatPoints);
  const purchasedItems = useProgressionStore((state) => state.purchasedItems);
  const purchaseStoreItem = useProgressionStore((state) => state.purchaseStoreItem);

  const items: Record<string, { id: string; name: string; price: number }[]> = {
    TRENDING: [
      { id: 't1', name: 'Assault Frame', price: 500 },
      { id: 't2', name: 'Recon Drone', price: 350 },
      { id: 't3', name: 'Ghost Cloak', price: 1200 },
    ],
    PROFILES: [
      { id: 'p1', name: 'Commander Avatar', price: 800 },
      { id: 'p2', name: 'Operative Icon', price: 450 },
    ],
    BORDERS: [
      { id: 'b1', name: 'Gold Frame', price: 300 },
      { id: 'b2', name: 'Shadow Border', price: 600 },
    ],
  };

  const CATS = ['TRENDING', 'PROFILES', 'BORDERS'] as const;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ImageBackground
        source={require('../assets/dashboard.png')}
        style={[styles.background, { width, height }]}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.topBarContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>STORE</Text>
              <Text style={styles.headerCaption}>Spend your threat points</Text>
            </View>

            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{threatPoints}</Text>
              <Text style={styles.headerBadgeIcon}>💀</Text>
            </View>
          </View>

          <View style={styles.centerContent}>
            <View style={styles.categoryRow}>
              {CATS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryBtn, cat === selectedCategory ? styles.categoryBtnActive : {}]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryBtnText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <FlatList
              data={items[selectedCategory]}
              keyExtractor={(it) => it.id}
              contentContainerStyle={{ paddingTop: normalize(24) }}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: normalize(20) }}
              renderItem={({ item }) => {
                const isOwned = purchasedItems.includes(item.id);

                return (
                  <View style={styles.itemCard}>
                    <ImageBackground source={require('../assets/dashboard.png')} style={styles.itemBg} imageStyle={styles.cardImage}>
                      <View style={styles.itemOverlay}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemPrice}>💀 {item.price}</Text>
                        <TouchableOpacity
                          style={[styles.buyBtn, isOwned && styles.buyBtnOwned]}
                          onPress={() => {
                            if (isOwned) return;
                            setSelectedItem(item);
                            setPurchaseModal(true);
                          }}
                          disabled={isOwned}
                        >
                          <Text style={[styles.buyBtnText, isOwned && styles.buyBtnTextOwned]}>
                            {isOwned ? 'OWNED' : 'BUY'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </ImageBackground>
                  </View>
                );
              }}
            />

            <Modal
              visible={purchaseModal}
              transparent
              animationType="fade"
              onRequestClose={() => {
                setPurchaseModal(false);
                setSelectedItem(null);
              }}
              supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
            >
              <View style={styles.modalOverlayCenter}>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
                  <Text style={styles.modalText}>Price: 💀 {selectedItem?.price}</Text>
                  <View style={{ flexDirection: 'row', marginTop: normalize(20) }}>
                    <TouchableOpacity
                      style={[styles.confirmButton, { marginRight: normalize(12) }]}
                      onPress={() => {
                        if (!selectedItem) {
                          setPurchaseModal(false);
                          setSelectedItem(null);
                          return;
                        }

                        if (purchasedItems.includes(selectedItem.id)) {
                          setPurchaseMessage('Already owned');
                        } else if (purchaseStoreItem(selectedItem.id, selectedItem.price)) {
                          setPurchaseMessage('Purchase successful');
                        } else {
                          setPurchaseMessage('Insufficient threat points');
                        }
                        setPurchaseModal(false);
                        setSelectedItem(null);
                        setTimeout(() => setPurchaseMessage(''), 2000);
                      }}
                    >
                      <Text style={styles.confirmButtonText}>CONFIRM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setPurchaseModal(false);
                        setSelectedItem(null);
                      }}
                    >
                      <Text style={styles.cancelButtonText}>CANCEL</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {purchaseMessage ? (
              <View style={styles.toast}>
                <Text style={styles.toastText}>{purchaseMessage}</Text>
              </View>
            ) : null}

          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050a15',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  safeArea: {
    flex: 1,
  },
  topBarContainer: {
    height: normalize(48),
    backgroundColor: 'rgba(5, 12, 24, 0.9)',
    borderBottomWidth: bw(1),
    borderTopWidth: bw(1),
    borderColor: '#bda05e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    marginTop: normalize(20),
  },
  headerTextWrap: {
    flex: 1,
    marginLeft: normalize(12),
  },
  backButton: {
    width: normalize(38),
    height: normalize(38),
    borderRadius: normalize(19),
    borderWidth: bw(2),
    borderColor: '#bda05e',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 15, 25, 0.9)',
    marginRight: normalize(12),
  },
  backButtonText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: normalize(16),
  },
  headerTitle: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: normalize(12),
    letterSpacing: 1,
  },
  headerCaption: {
    color: '#8aa8d0',
    fontFamily: 'PixelFont',
    fontSize: normalize(8),
    marginTop: normalize(2),
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: bw(1),
    borderColor: '#bda05e',
    borderRadius: normalize(999),
    backgroundColor: '#bda05e18',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
  },
  headerBadgeText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: normalize(10),
    marginRight: normalize(4),
  },
  headerBadgeIcon: {
    fontSize: normalize(10),
  },
  centerContent: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: normalize(24),
    paddingTop: normalize(36),
  },
  sectionHeader: {
    color: '#bda05e',
    fontFamily: 'PixelFont',
    fontSize: normalize(20),
    marginBottom: normalize(16),
  },
  cardRow: {
    flexDirection: 'row',
    gap: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopCard: {
    width: normalize(240),
    height: normalize(240),
    borderRadius: normalize(12),
    overflow: 'hidden',
    borderWidth: bw(2),
    borderColor: '#bda05e',
    backgroundColor: 'rgba(10, 15, 25, 0.8)',
  },
  cardBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cardImage: {
    opacity: 0.18,
  },
  cardOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  cardLabel: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: normalize(16),
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: normalize(12),
    marginTop: normalize(8),
  },
  categoryBtn: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    borderRadius: normalize(8),
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: bw(1),
    borderColor: 'transparent',
  },
  categoryBtnActive: {
    borderColor: '#bda05e',
  },
  categoryBtnText: {
    color: '#fff',
    fontFamily: 'PixelFont',
    fontSize: normalize(12),
  },
  itemCard: {
    width: '48%',
    height: normalize(160),
    borderRadius: normalize(10),
    overflow: 'hidden',
    borderWidth: bw(1),
    borderColor: '#1e2b3c',
    backgroundColor: '#0b141e',
  },
  itemBg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  itemOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemName: {
    color: '#fff',
    fontFamily: 'PixelFont',
    fontSize: normalize(14),
    marginBottom: normalize(8),
  },
  itemPrice: {
    color: '#bda05e',
    fontFamily: 'PixelFont',
    fontSize: normalize(12),
    marginBottom: normalize(12),
  },
  buyBtn: {
    backgroundColor: '#0a3d5e',
    paddingHorizontal: normalize(18),
    paddingVertical: normalize(8),
    borderRadius: normalize(8),
  },
  buyBtnOwned: {
    backgroundColor: '#1f3d2b',
  },
  buyBtnText: {
    color: '#fff',
    fontFamily: 'PixelFont',
    fontSize: normalize(12),
  },
  buyBtnTextOwned: {
    color: '#7ddf8d',
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: normalize(320),
    backgroundColor: '#0b141e',
    padding: normalize(20),
    borderRadius: normalize(12),
    borderWidth: bw(1),
    borderColor: '#1e2b3c',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontFamily: 'PixelFont',
    fontSize: normalize(18),
  },
  modalText: {
    color: '#bda05e',
    marginTop: normalize(8),
  },
  confirmButton: {
    backgroundColor: '#bda05e',
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(16),
    borderRadius: normalize(8),
  },
  confirmButtonText: {
    color: '#050a15',
    fontFamily: 'PixelFont',
    fontSize: normalize(12),
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(16),
    borderRadius: normalize(8),
  },
  cancelButtonText: {
    color: '#fff',
    fontFamily: 'PixelFont',
    fontSize: normalize(12),
  },
  toast: {
    position: 'absolute',
    bottom: normalize(40),
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    borderRadius: normalize(8),
    borderWidth: bw(1),
    borderColor: '#1e2b3c',
  },
  toastText: {
    color: '#fff',
    fontFamily: 'PixelFont',
  },
});
