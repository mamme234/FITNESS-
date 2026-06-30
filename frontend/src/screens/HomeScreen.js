import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { useWorkout } from '../contexts/WorkoutContext';
import { getTodayWorkout, getProgressSummary } from '../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { todayWorkout, setTodayWorkout } = useWorkout();
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [quote, setQuote] = useState({
    text: 'The only bad workout is the one that didn\'t happen.',
    author: 'Unknown'
  });

  const fetchData = async () => {
    try {
      const workout = await getTodayWorkout();
      setTodayWorkout(workout);
      
      const stats = await getProgressSummary();
      setSummary(stats);
    } catch (error) {
      console.error('Fetch home data error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning 👋</Text>
          <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image 
            source={{ uri: user?.avatar || 'https://via.placeholder.com/50' }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* Motivational Quote */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>"{quote.text}"</Text>
        <Text style={styles.quoteAuthor}>— {quote.author}</Text>
      </View>

      {/* Today's Workout */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Workout</Text>
        {todayWorkout ? (
          <TouchableOpacity 
            style={styles.workoutCard}
            onPress={() => navigation.navigate('WorkoutPlayer', { workout: todayWorkout })}
          >
            <Icon name="dumbbell" size={30} color="#FF6B35" />
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>{todayWorkout.name}</Text>
              <Text style={styles.workoutMeta}>
                {todayWorkout.exercises?.length || 0} exercises • {todayWorkout.duration || 45} min
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '30%' }]} />
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#8E8EA0" />
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyCard}>
            <Icon name="calendar-check" size={40} color="#8E8EA0" />
            <Text style={styles.emptyText}>No workout scheduled today</Text>
            <Text style={styles.emptySubtext}>Rest day or explore programs</Text>
          </View>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon name="fire" size={24} color="#FF6B35" />
            <Text style={styles.statValue}>{summary?.streak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="star" size={24} color="#FFD700" />
            <Text style={styles.statValue}>{user?.level || 1}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="lightning-bolt" size={24} color="#00D4FF" />
            <Text style={styles.statValue}>{summary?.xp || 0}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="clock" size={24} color="#7C5CFC" />
            <Text style={styles.statValue}>{summary?.totalMinutes || 0}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Workout')}
          >
            <Icon name="play" size={24} color="#4CAF50" />
            <Text style={styles.actionLabel}>Start Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Exercise')}
          >
            <Icon name="magnify" size={24} color="#FF6B35" />
            <Text style={styles.actionLabel}>Search Exercise</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Nutrition')}
          >
            <Icon name="food" size={24} color="#FF9800" />
            <Text style={styles.actionLabel}>Log Meal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Progress')}
          >
            <Icon name="chart-line" size={24} color="#7C5CFC" />
            <Text style={styles.actionLabel}>View Progress</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
  },
  greeting: {
    color: '#8E8EA0',
    fontSize: 14,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  quoteCard: {
    backgroundColor: '#252540',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  quoteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  quoteAuthor: {
    color: '#8E8EA0',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  workoutCard: {
    backgroundColor: '#252540',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutInfo: {
    flex: 1,
    marginLeft: 12,
  },
  workoutName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  workoutMeta: {
    color: '#8E8EA0',
    fontSize: 12,
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#3A3A5A',
    borderRadius: 2,
    marginTop: 8,
    width: '100%',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  emptyCard: {
    backgroundColor: '#252540',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
  },
  emptySubtext: {
    color: '#8E8EA0',
    fontSize: 12,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    backgroundColor: '#252540',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    minWidth: (width - 48) / 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    color: '#8E8EA0',
    fontSize: 10,
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionCard: {
    backgroundColor: '#252540',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    minWidth: (width - 48) / 4,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});
