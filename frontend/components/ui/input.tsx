import * as React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

export type InputProps = TextFieldProps;

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <TextField variant='outlined' fullWidth size='small' inputRef={ref} {...props} />;
});

Input.displayName = 'Input';
