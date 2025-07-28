// mobile/WalletApp/src/screens/HistoryScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Transfer = {
  id: number;
  fromPhone: string;
  toPhone: string;
  amount: number;
  createdAt: string;
  status: 'success' | 'failed';
  reason?: string;
};

export default function HistoryScreen() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const { width: screenWidth } = useWindowDimensions();
  const CARD_WIDTH = screenWidth * 0.9;

  const fetchHistory = useCallback(
    async (pageToLoad: number) => {
      // no intentar más allá de los límites
      if (pageToLoad < 1 || pageToLoad > totalPages) {
        return;
      }

      // feedback
      pageToLoad === 1 ? setRefreshing(true) : setLoadingMore(true);

      try {
        const token = await AsyncStorage.getItem('userToken');
        const res = await fetch(
          `http://10.0.2.2:3001/transferencias?page=${pageToLoad}&pageSize=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();

        if (!res.ok) {
          Alert.alert('Error', json.error || 'No se pudo cargar el historial');
        } else {
          setTransfers(json.transfers);
          setPage(json.pagination.page);
          setTotalPages(json.pagination.totalPages);
        }
      } catch (err: any) {
        Alert.alert('Error de red', err.message);
      } finally {
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [totalPages]
  );

  // carga inicial
  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  const renderItem = ({ item }: { item: Transfer }) => (
    <View style={[styles.item, { width: CARD_WIDTH }]}>
      <Text style={styles.line}>
        <Text style={styles.label}>Fecha:</Text>{' '}
        {new Date(item.createdAt).toLocaleString()}
      </Text>
      <Text style={styles.line}>
        <Text style={styles.label}>Monto:</Text> ${item.amount.toLocaleString()}
      </Text>
      <Text style={styles.line}>
        <Text style={styles.label}>De:</Text> {item.fromPhone}{' '}
        <Text style={styles.label}>A:</Text> {item.toPhone}
      </Text>
      <Text style={styles.line}>
        <Text style={styles.label}>Estado:</Text>{' '}
        {item.status === 'success' ? 'Éxito' : 'Fallida'}
      </Text>
      {item.status === 'failed' && item.reason && (
        <Text style={styles.line}>
          <Text style={styles.label}>Razón:</Text> {item.reason}
        </Text>
      )}
    </View>
  );

  // Componente de cabecera de lista para mostrar paginación
  const ListHeader = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
        onPress={() => fetchHistory(page - 1)}
        disabled={page <= 1}
      >
        <Text style={styles.pageBtnText}>Anterior</Text>
      </TouchableOpacity>

      <Text style={styles.pageInfo}>
        Página {page} de {totalPages}
      </Text>

      <TouchableOpacity
        style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
        onPress={() => fetchHistory(page + 1)}
        disabled={page >= totalPages}
      >
        <Text style={styles.pageBtnText}>Siguiente</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={transfers}
        keyExtractor={(t) => t.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={transfers.length === 0 && styles.emptyContainer}
        ListEmptyComponent={() =>
          !refreshing ? <Text style={styles.empty}>Sin movimientos</Text> : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchHistory(1)}
          />
        }
        ListHeaderComponent={ListHeader}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator style={{ margin: 16 }} /> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    alignItems: 'center',
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    elevation: 2,
  },
  line: { marginBottom: 4, fontSize: 14, color: '#333' },
  label: { fontWeight: '600' },

  // paginación
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
    width: '90%',
  },
  pageBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#0066ff',
    borderRadius: 4,
  },
  pageBtnDisabled: {
    backgroundColor: '#aac4ff',
  },
  pageBtnText: {
    color: '#fff',
    fontSize: 14,
  },
  pageInfo: {
    fontSize: 14,
    color: '#333',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    fontSize: 16,
    color: '#666',
  },
});
