import { ThemeConfig } from "antd";

export const theme: ThemeConfig = {
  token: {
    colorPrimary: "#0f6e64",
    colorInfo: "#0f6e64",
    colorSuccess: "#2f7d4a",
    colorWarning: "#b86a1d",
    colorError: "#b42318",
    colorText: "#1c1917",
    colorTextSecondary: "#6d655d",
    colorBorder: "#e4dcd0",
    colorBgContainer: "#fffcf8",
    colorBgLayout: "#f3efe7",
    borderRadius: 12,
    fontFamily: '"Outfit", system-ui, sans-serif',
    controlHeight: 40,
    boxShadow: "0 12px 32px rgba(48, 34, 18, 0.06)",
  },
  components: {
    Button: { fontWeight: 600, primaryShadow: "none", defaultShadow: "none" },
    Card: { headerBg: "transparent" },
    Table: {
      headerBg: "#f6f1e8",
      headerColor: "#6d655d",
      headerSplitColor: "transparent",
      rowHoverBg: "#f8f4ed",
      borderColor: "#efe7db",
    },
    Modal: { titleFontSize: 22 },
    Input: { activeShadow: "0 0 0 3px rgba(15, 110, 100, 0.12)" },
    Select: { optionSelectedBg: "#e7f3f1" },
  },
};
