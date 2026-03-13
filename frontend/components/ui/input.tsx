import TextField, { TextFieldProps } from "@mui/material/TextField";

export type InputProps = TextFieldProps;

export const Input = (props: InputProps) => {
  return (
    <TextField
      variant="outlined"
      fullWidth
      size="small"
      {...props}
    />
  );
};

