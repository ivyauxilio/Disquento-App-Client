// app/profile/edit.tsx

import { profileAPI } from "@/api/profile";
import {
  fetchProfile,
  selectProfile,
  selectProfileUpdating,
  updateProfile,
} from "@/store/slices/profileSlice";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const updating = useSelector(selectProfileUpdating);

  const user = profile?.user ?? profile ?? {};

  const [form, setForm] = useState({
    firstname: user.firstname ?? "",
    lastname: user.lastname ?? "",
    phone: user.phone ?? "",
    birthdate: user.birthdate ?? "",
    gender: user.gender ?? "",
  });

  const [avatar, setAvatar] = useState<string | null>(user.avatar_url ?? null);
  const [avatarFile, setAvatarFile] = useState<any>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile() as any);
  }, [dispatch]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow photo access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAvatar(asset.uri);
      setAvatarFile(asset);
      await uploadAvatar(asset);
    }
  };

  const uploadAvatar = async (asset: any) => {
    try {
      setUploadingAvatar(true);

      const formData = new FormData();
      formData.append("avatar", {
        uri: asset.uri,
        name: asset.fileName ?? "avatar.jpg",
        type: asset.mimeType ?? "image/jpeg",
      } as any);

      await profileAPI.uploadAvatar(formData);
      Alert.alert("Success", "Profile photo updated!");
    } catch (e: any) {
      Alert.alert("Upload failed", e.response?.data?.message ?? "Try again.");
      setAvatar(user.avatar_url ?? null);
      setAvatarFile(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.firstname.trim()) {
      Alert.alert("Missing info", "First name is required.");
      return;
    }
    if (!form.lastname.trim()) {
      Alert.alert("Missing info", "Last name is required.");
      return;
    }

    try {
      await dispatch(updateProfile(form) as any).unwrap();
      Alert.alert("Saved", "Your profile has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Update failed", e || "Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="inverted" backgroundColor="#6C3DF5" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.85}>
              <View style={styles.avatarWrap}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitial}>
                      {(form.firstname?.[0] ?? "U").toUpperCase()}
                    </Text>
                  </View>
                )}

                <View style={styles.avatarEdit}>
                  {uploadingAvatar ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Ionicons name="camera" size={14} color="#fff" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to change photo</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={form.firstname}
              onChangeText={(v) => handleChange("firstname", v)}
              placeholder="Juan"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={form.lastname}
              onChangeText={(v) => handleChange("lastname", v)}
              placeholder="Dela Cruz"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user.email ?? ""}
              editable={false}
            />
            <Text style={styles.helperText}>
              Email cannot be changed. Contact support if needed.
            </Text>

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={(v) => handleChange("phone", v)}
              keyboardType="phone-pad"
              placeholder="09XX XXX XXXX"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Birthdate</Text>
            <TextInput
              style={styles.input}
              value={form.birthdate}
              onChangeText={(v) => handleChange("birthdate", v)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              {["male", "female", "other"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderChip,
                    form.gender === g && styles.genderChipActive,
                  ]}
                  onPress={() => handleChange("gender", g)}
                >
                  <Text
                    style={[
                      styles.genderText,
                      form.gender === g && styles.genderTextActive,
                    ]}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Save */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.saveBtn, updating && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#111827" },

  avatarSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatarWrap: { position: "relative" },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "#fff",
  },
  avatarFallback: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#6C3DF5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  avatarInitial: { color: "#fff", fontSize: 44, fontWeight: "800" },
  avatarEdit: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6C3DF5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarHint: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 10,
  },

  form: {
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 15,
    color: "#111827",
  },
  inputDisabled: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
  },
  helperText: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
  },
  genderChipActive: {
    borderColor: "#6C3DF5",
    backgroundColor: "#f5f3ff",
  },
  genderText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6b7280",
  },
  genderTextActive: { color: "#6C3DF5" },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#6C3DF5",
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#6C3DF5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
