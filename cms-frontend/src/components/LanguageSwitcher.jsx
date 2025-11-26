import React, { useState } from "react";
import { Box, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import i18n from "../i18n";

const SUPPORTED_LANGS = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fa", label: "فارسی" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" }, // 🇮🇹
];

export default function LanguageSwitcher() {
  const [anchorEl, setAnchorEl] = useState(null);
  const current = i18n.language || "en";

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  function changeLang(lang) {
    const isRTL = lang === "fa";
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
    localStorage.setItem("language", lang);
    i18n.changeLanguage(lang);
    window.dispatchEvent(new Event("languageChanged"));
    handleClose();
  }

  return (
    <Box>
      <Tooltip title={current.toUpperCase()}>
        <IconButton
          onClick={handleClick}
          color="inherit"
          sx={{ bgcolor: "action.hover" }}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        {SUPPORTED_LANGS.map((l) => (
          <MenuItem key={l.code} onClick={() => changeLang(l.code)}>
            {l.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
