import ButtonMUI, { ButtonProps as MUIButtonProps } from "@mui/material/Button";

export type ButtonProps = MUIButtonProps;

export const Button = (props: ButtonProps) => {
  return (
    <ButtonMUI
      variant={props.variant ?? "contained"}
      {...props}
      sx={{
        borderRadius: 999,
        textTransform: "none",
        ...(props.sx || {})
      }}
    />
  );
};

