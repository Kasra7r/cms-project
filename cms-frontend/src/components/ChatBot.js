import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Stack,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import api from "../services/api";
import { useTranslation } from "react-i18next";

export default function ChatBot() {
  const { t } = useTranslation("common");

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (open)
      setTimeout(() => {
        listRef.current?.scrollTo(
          0,
          listRef.current.scrollHeight
        );
      }, 0);
  }, [open, messages]);

  async function sendMessage(e) {
    e?.preventDefault?.();
    const text = value.trim();
    if (!text || sending) return;
    setMessages((m) => [
      ...m,
      { role: "user", content: text },
    ]);
    setValue("");
    setSending(true);
    try {
      const history = messages
        .slice(-10)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));
      const { data } = await api.post("/api/chat", {
        message: text,
        history,
      });
      const reply =
        (data && data.reply) ||
        t(
          "chat.error",
          "Sorry, something went wrong."
        );
      setMessages((m) => [
        ...m,
        { role: "assistant", content: reply },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: t(
            "chat.connectionError",
            "Connection error."
          ),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {!open && (
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            right: 20,
            bottom: 20,
            zIndex: 1300,
            bgcolor: "primary.main",
            color: "#fff",
            "&:hover": {
              bgcolor: "primary.dark",
            },
          }}
          size="large"
        >
          <ChatIcon />
        </IconButton>
      )}

      {open && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            right: 20,
            bottom: 20,
            width: 360,
            height: 480,
            display: "flex",
            flexDirection: "column",
            zIndex: 1300,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              px: 2,
              py: 1,
              bgcolor: "primary.main",
              color: "#fff",
            }}
          >
            <Typography
              sx={{ fontWeight: 700, flex: 1 }}
            >
              {t("chat.title", "PageCraft Assistant")}
            </Typography>
            <IconButton
              onClick={() => setOpen(false)}
              size="small"
              sx={{ color: "#fff" }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          <Box
            ref={listRef}
            sx={{
              flex: 1,
              p: 2,
              overflow: "auto",
              bgcolor: "background.default",
            }}
          >
            {messages.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {t(
                  "chat.emptyState",
                  "Hi, I'm your PageCraft assistant. Ask me about your projects, tasks, or users."
                )}
              </Typography>
            )}
            <Stack spacing={1.2}>
              {messages.map((m, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    justifyContent:
                      m.role === "user"
                        ? "flex-end"
                        : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      px: 1.25,
                      py: 0.75,
                      maxWidth: "80%",
                      borderRadius: 2,
                      bgcolor:
                        m.role === "user"
                          ? "primary.main"
                          : "action.hover",
                      color:
                        m.role === "user"
                          ? "#fff"
                          : "text.primary",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {m.content}
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          <Divider />
          <Stack
            component="form"
            onSubmit={sendMessage}
            direction="row"
            spacing={1}
            sx={{ p: 1.25 }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder={t(
                "chat.placeholder",
                "Type a message."
              )}
              value={value}
              onChange={(e) =>
                setValue(e.target.value)
              }
              disabled={sending}
            />
            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon />}
              disabled={sending || !value.trim()}
            >
              {t("chat.send", "Send")}
            </Button>
          </Stack>
        </Paper>
      )}
    </>
  );
}
