import * as React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

export type InputProps = TextFieldProps;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(props, ref) {
    return (
      <TextField
        variant='outlined'
        fullWidth
        size='small'
        {...props}
        inputRef={ref}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
          ...props.sx,
        }}
      />
    );
  },
);
