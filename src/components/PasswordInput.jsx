import React, { useState } from 'react';
import { Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useField, useFormikContext } from 'formik';

const PasswordInput = ({ name, label = "Password", style, ...rest }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { setFieldTouched } = useFormikContext();
  const [field, meta, helpers] = useField(name);

  const hasError = meta.touched && meta.error;

  return (
    <>
      <TextInput
        style={style}
        label={label}
        mode="outlined"
        placeholder={label}
        secureTextEntry={!showPassword}
        value={field.value}
        onChangeText={helpers.setValue}
        onBlur={() => setFieldTouched(name)}
        error={!!hasError}
        placeholderTextColor="#888"
        activeOutlineColor="#1E90FF"
        {...rest}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowPassword(prev => !prev)}
          />
        }
      />
      {hasError && <Text style={{ color: 'red', alignSelf: 'flex-start', marginBottom: 10}}>{meta.error}</Text>}
    </>
  );
};

export default PasswordInput;
