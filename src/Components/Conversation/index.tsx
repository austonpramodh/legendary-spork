import React from "react";
import { CometChat } from "@cometchat-pro/chat";
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Container,
    TextField,
    Toolbar,
    Typography,
    LinearProgress,
    IconButton,
} from "@mui/material";
import { Call } from "@mui/icons-material";
import { useActiveConversationContext } from "../../Contexts/ActiveConversation";
import Messages from "./Messages";
import { useCallContext } from "../../Contexts/CallContext";

const Conversation = () => {
    const { conversation, isLoading, messages, sendMessage, isSendingMessage, fetchPrevMessages } =
        useActiveConversationContext();
    const [inputMessage, setInputMessage] = React.useState("");
    const { onStartCall } = useCallContext();

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
                        <Box sx={{ flexGrow: 1, display: "flex" }} />
                        {conversationType === "user" && (
                            <IconButton onClick={() => onStartCall(conversationWith as CometChat.User)}>
                                <Call />
                            </IconButton>
                        )}
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
                    <Button
                        variant="contained"
                        onClick={() => {
                            fetchPrevMessages();
                        }}
                    >
                        Load More - currently loaded - {messages.length}
                    </Button>
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
                    disabled={isSendingMessage}
                    onChange={(e) => {
                        setInputMessage(e.target.value);
                    }}
                    onFocus={() => {
                        // Send typing even
                        const receiverType =
                            conversation.getConversationType() === "user"
                                ? CometChat.RECEIVER_TYPE.USER
                                : CometChat.RECEIVER_TYPE.GROUP;
                        const typingNotification = new CometChat.TypingIndicator(receiverId, receiverType);
                        CometChat.startTyping(typingNotification);
                    }}
                    onBlur={() => {
                        const receiverType =
                            conversation.getConversationType() === "user"
                                ? CometChat.RECEIVER_TYPE.USER
                                : CometChat.RECEIVER_TYPE.GROUP;
                        const typingNotification = new CometChat.TypingIndicator(receiverId, receiverType);
                        CometChat.endTyping(typingNotification);
                    }}
                />
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        p: 2,
                    }}
                >
                    <Button disabled={isSendingMessage} variant="contained" onClick={onSendMessage}>
                        Send Message
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default Conversation;
