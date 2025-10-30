import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Flame, Target, Award, RotateCcw, LogOut, Edit2, X } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import Mascot from '@/components/Mascot';
import Colors from '@/constants/colors';
import { useState } from 'react';

export default function ProfileScreen() {
  const { progress, achievements, resetProgress } = useApp();
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [editUsername, setEditUsername] = useState<string>(user?.username || '');
  const [editBio, setEditBio] = useState<string>(user?.bio || '');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const handleReset = () => {
    Alert.alert(
      'Reiniciar Progreso',
      '¿Estás seguro de que quieres reiniciar todo tu progreso? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          style: 'destructive',
          onPress: () => resetProgress(),
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login' as any);
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    setEditUsername(user?.username || '');
    setEditBio(user?.bio || '');
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editUsername.trim()) {
      Alert.alert('Error', 'El nombre de usuario no puede estar vacío');
      return;
    }

    if (editUsername.length < 3) {
      Alert.alert('Error', 'El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    setIsUpdating(true);
    const result = await updateProfile({
      username: editUsername.trim(),
      bio: editBio.trim(),
    });
    setIsUpdating(false);

    if (result.success) {
      setIsEditModalVisible(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } else {
      Alert.alert('Error', result.error || 'Error al actualizar perfil');
    }
  };

  const unlockedAchievements = achievements.filter((a) => a.isUnlocked);
  const lockedAchievements = achievements.filter((a) => !a.isUnlocked);

  return (
    <View style={styles.container}>
      <LinearGradient colors={Colors.gradient.primary as any} style={styles.header}>
        <View style={styles.headerContent}>
          <Mascot emotion="happy" size={80} />
          <View style={styles.userInfoRow}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.username || 'Usuario'}</Text>
              <Text style={styles.userLevel}>Nivel {progress.currentLevel}</Text>
              {user?.bio ? <Text style={styles.userBio}>{user.bio}</Text> : null}
            </View>
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Edit2 size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Trophy size={32} color={Colors.xp} />
            <Text style={styles.statCardValue}>{progress.totalXP}</Text>
            <Text style={styles.statCardLabel}>XP Total</Text>
          </View>

          <View style={styles.statCard}>
            <Flame size={32} color={Colors.streak} />
            <Text style={styles.statCardValue}>{progress.streak}</Text>
            <Text style={styles.statCardLabel}>Racha</Text>
          </View>

          <View style={styles.statCard}>
            <Target size={32} color={Colors.primary} />
            <Text style={styles.statCardValue}>{progress.completedLessons.length}</Text>
            <Text style={styles.statCardLabel}>Lecciones</Text>
          </View>

          <View style={styles.statCard}>
            <Award size={32} color={Colors.secondary} />
            <Text style={styles.statCardValue}>{unlockedAchievements.length}</Text>
            <Text style={styles.statCardLabel}>Logros</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logros Desbloqueados</Text>
          {unlockedAchievements.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Completa lecciones para desbloquear logros</Text>
            </View>
          ) : (
            <View style={styles.achievementsContainer}>
              {unlockedAchievements.map((achievement) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  </View>
                  <View style={styles.achievementBadge}>
                    <Text style={styles.achievementBadgeText}>✓</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logros Bloqueados</Text>
          <View style={styles.achievementsContainer}>
            {lockedAchievements.map((achievement) => (
              <View key={achievement.id} style={[styles.achievementCard, styles.achievementCardLocked]}>
                <Text style={styles.achievementIconLocked}>{achievement.icon}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementTitle, styles.achievementTitleLocked]}>
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <RotateCcw size={20} color={Colors.error} />
          <Text style={styles.resetButtonText}>Reiniciar Progreso</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.white} />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Nombre de usuario</Text>
              <TextInput
                style={styles.modalInput}
                value={editUsername}
                onChangeText={setEditUsername}
                placeholder="Nombre de usuario"
                placeholderTextColor={Colors.textLight}
                autoCapitalize="none"
                editable={!isUpdating}
              />

              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={[styles.modalInput, styles.modalInputMultiline]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Cuéntanos sobre ti..."
                placeholderTextColor={Colors.textLight}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isUpdating}
              />

              <TouchableOpacity
                style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
                onPress={handleSaveProfile}
                disabled={isUpdating}
              >
                <Text style={styles.saveButtonText}>
                  {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  userInfo: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
    textAlign: 'center',
  },
  userLevel: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  userBio: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.85,
    textAlign: 'center',
    marginTop: 4,
  },
  editButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statCardLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  achievementsContainer: {
    gap: 12,
  },
  achievementCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 40,
  },
  achievementIconLocked: {
    fontSize: 40,
    opacity: 0.5,
  },
  achievementInfo: {
    flex: 1,
    gap: 4,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  achievementTitleLocked: {
    color: Colors.textLight,
  },
  achievementDescription: {
    fontSize: 14,
    color: Colors.textLight,
  },
  achievementBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementBadgeText: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '700' as const,
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.error,
    marginTop: 16,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.error,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.error,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalBody: {
    padding: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalInputMultiline: {
    minHeight: 100,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
