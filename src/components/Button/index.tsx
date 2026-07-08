import styles from "./button.module.css";

type ButtonProps = {
  variant?: "primary" | "secondary" | "destructive";
  size?: string;
  children: React.ReactNode;
} & React.ComponentProps<"button">;

export function Button({
  size = "100%",
  children,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button style={{ width: size }} className={styles[variant]} {...props}>
      {children}
    </button>
  );
}
