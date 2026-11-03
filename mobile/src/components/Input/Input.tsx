import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { Control, RegisterOptions, useController } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { cores } from "../../theme/cores";

interface Props extends TextInputProps {
  name: string;
  control: Control<any>;
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  required?: boolean | string;
  // Regras extras do react-hook-form (pattern, minLength, validate...).
  rules?: Omit<RegisterOptions, "required">;
  // "filled": campo escuro das telas internas; "underline": campo sublinhado
  // das telas de login/cadastro (fundo limão).
  variant?: "filled" | "underline";
}

export const Input = ({
  name,
  control,
  label,
  error,
  icon,
  onBlur,
  onFocus,
  required,
  rules,
  variant = "filled",
  ...rest
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const {
    field: { value, onChange, onBlur: fieldOnBlur },
    fieldState: { error: fieldError },
  } = useController({
    name,
    control,
    defaultValue: "",
    rules: {
      ...rules,
      required: required === true ? "Este campo é obrigatório" : required,
    },
  });

  const ehSublinhado = variant === "underline";
  const errorMessage = error || fieldError?.message;
  const corTexto = ehSublinhado ? cores.textoEscuro : cores.texto;
  const iconColor = errorMessage
    ? cores.perigo
    : isFocused
    ? ehSublinhado
      ? cores.textoEscuro
      : cores.destaque
    : cores.neutro;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: corTexto }]}>{label}</Text>
      )}

      <View
        style={[
          ehSublinhado ? styles.inputSublinhado : styles.inputPreenchido,
          isFocused && !ehSublinhado && styles.focused,
          !!errorMessage && styles.error,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={iconColor}
            style={styles.icon}
          />
        )}

        <TextInput
          style={[styles.field, { color: corTexto }]}
          value={value}
          onChangeText={onChange}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            fieldOnBlur();
            onBlur?.(e);
          }}
          placeholderTextColor={ehSublinhado ? "#5F6A1E" : cores.neutro}
          {...rest}
        />

        {value?.length > 0 && (
          <TouchableOpacity onPress={() => onChange("")}>
            <Ionicons name="close-circle" size={18} color={cores.neutro} />
          </TouchableOpacity>
        )}
      </View>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%", marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputPreenchido: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: cores.cartao,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingHorizontal: 12,
    height: 52,
  },
  inputSublinhado: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: cores.textoEscuro,
    height: 44,
  },
  focused: { borderColor: cores.destaque },
  error: { borderColor: cores.perigo, borderBottomColor: cores.perigo },
  icon: { marginRight: 10 },
  field: { flex: 1, fontSize: 16 },
  errorText: { fontSize: 12, color: cores.perigo, marginTop: 4, marginLeft: 4 },
});
