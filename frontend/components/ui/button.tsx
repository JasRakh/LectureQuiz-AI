import ButtonMUI, { ButtonProps as MUIButtonProps } from '@mui/material/Button';

export type ButtonProps = MUIButtonProps;

export const Button = (props: ButtonProps) => {
  return (
    <ButtonMUI
      variant={props.variant ?? 'contained'}
      disableElevation
      {...props}
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 500,
        ...props.sx,
      }}
    />
  );
};
