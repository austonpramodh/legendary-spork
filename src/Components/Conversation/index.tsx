import React from "react";
import { CometChat } from "@cometchat-pro/chat";
import { AppBar, Avatar, Box, Button, Container, TextField, Toolbar, Typography, LinearProgress } from "@mui/material";

import { useActiveConversationContext } from "../../Contexts/ActiveConversation";
import Messages from "./Messages";

const Conversation = () => {
    const { conversation, isLoading, messages, sendMessage } = useActiveConversationContext();
    const [inputMessage, setInputMessage] = React.useState("");

    if (!conversation)
        return (
            <Box
                sx={(theme) => ({
                    backgroundColor: theme.palette.background.paper,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    border: `1px solid ${theme.palette.divider}`,
                    justifyContent: "center",
                    alignItems: "center",
                    p: 2,
                })}
            >
                <Typography variant="body1" noWrap component="div" sx={{ ml: 2, display: { xs: "none", md: "flex" } }}>
                    Please select a Conversation!
                </Typography>
            </Box>
        );

    if (isLoading)
        return (
            <Box
                sx={(theme) => ({
                    backgroundColor: theme.palette.background.paper,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    border: `1px solid ${theme.palette.divider}`,
                    justifyContent: "center",
                    textAlign: "center",
                    p: 2,
                })}
            >
                <Typography variant="body1" noWrap component="div" sx={{ ml: 2 }}>
                    Loading....
                </Typography>
                <LinearProgress sx={{ width: "100%" }} color="secondary" />
            </Box>
        );

    const conversationWith = conversation.getConversationWith();
    const conversationType = conversation.getConversationType();

    const icon =
        conversationType === "group"
            ? (conversationWith as CometChat.Group).getIcon()
            : (conversationWith as CometChat.User).getAvatar();
    const receiverId =
        conversationType === "group"
            ? (conversationWith as CometChat.Group).getGuid()
            : (conversationWith as CometChat.User).getUid();

    const onSendMessage = async () => {
        await sendMessage(new CometChat.TextMessage(receiverId, inputMessage, conversationType));
        setInputMessage("");
    };

    return (
        <Box
            sx={(theme) => ({
                backgroundColor: theme.palette.background.paper,
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                border: `1px solid ${theme.palette.divider}`,
            })}
        >
            <AppBar position="static" sx={{ mx: "-2" }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <Avatar alt={conversationWith.getName()} src={icon} />
                        <Typography
                            variant="body1"
                            noWrap
                            component="div"
                            sx={{ ml: 2, display: { xs: "none", md: "flex" } }}
                        >
                            {conversationWith.getName()}
                        </Typography>
                    </Toolbar>
                </Container>
            </AppBar>

            <Box
                sx={() => ({
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    px: 2,
                })}
            >
                <Box sx={{ flexGrow: 1, maxHeight: "58vh", overflowY: "scroll", p: 2 }}>
                    <Messages messages={messages} />
                </Box>
                <TextField
                    multiline
                    maxRows={4}
                    id="outlined-basic"
                    label="Message"
                    placeholder="Type your message!"
                    variant="outlined"
                    sx={{ width: "100%" }}
                    value={inputMessage}
                    onChange={(e) => {
                        setInputMessage(e.target.value);
                    }}
                />
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        p: 2,
                    }}
                >
                    <Button variant="contained" onClick={onSendMessage}>
                        Send Message
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default Conversation;
