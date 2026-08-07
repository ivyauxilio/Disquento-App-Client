import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { AppDispatch, RootState } from "../../store";
import { clearError, registerUser } from "../../store/slices/authSlice";
import { colors } from "../../theme/colors";

interface RegisterErrors {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  password?: string;
  password_confirmation?: string;
}

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState<RegisterErrors>({});

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  React.useEffect(() => {
    if (error) {
      let message = "Registration failed";
      if (typeof error === "object")
        message = Object.values(error).flat().join("\n");
      else if (typeof error === "string") message = error;
      Alert.alert("Error", message);
      dispatch(clearError());
    }
  }, [error]);

  const validate = () => {
    const newErrors: any = {};
    if (!formData.firstname) newErrors.firstname = "First name is required";
    if (!formData.lastname) newErrors.lastname = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (validate()) {
      const result = await dispatch(registerUser(formData));
      if (registerUser.fulfilled.match(result)) {
        router.replace("/(tabs)/dashboard");
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us today</Text>
        </View>
        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="First Name"
                placeholder="John"
                value={formData.firstname}
                onChangeText={(text) =>
                  setFormData({ ...formData, firstname: text })
                }
                error={errors.firstname}
              />
            </View>
            <View style={styles.halfWidth}>
              <Input
                label="Last Name"
                placeholder="Doe"
                value={formData.lastname}
                onChangeText={(text) =>
                  setFormData({ ...formData, lastname: text })
                }
                error={errors.lastname}
              />
            </View>
          </View>
          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail"
            error={errors.email}
          />
          <Input
            label="Phone Number"
            placeholder="Enter your phone"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
            leftIcon="phone"
          />
          <Input
            label="Password"
            placeholder="Create a password"
            value={formData.password}
            onChangeText={(text) =>
              setFormData({ ...formData, password: text })
            }
            secureTextEntry
            leftIcon="lock"
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.password_confirmation}
            onChangeText={(text) =>
              setFormData({ ...formData, password_confirmation: text })
            }
            secureTextEntry
            leftIcon="lock"
            error={errors.password_confirmation}
          />
          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
          />
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: { marginBottom: 32 },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.gray[900],
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: colors.gray[500] },
  form: { flex: 1 },
  row: { flexDirection: "row", gap: 12 },
  halfWidth: { flex: 1 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: colors.gray[600], fontSize: 14 },
  footerLink: { color: colors.purple.main, fontSize: 14, fontWeight: "600" },
});
