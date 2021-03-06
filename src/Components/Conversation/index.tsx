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
import { Call, DeleteForever, VideoCall } from "@mui/icons-material";
import { useActiveConversationContext } from "../../Contexts/ActiveConversation";
import Messages from "./Messages";
import { useCallContext } from "../../Contexts/CallContext";

interface HeaderProps {
    name: string;
    icon: string;
    conversationType: string;
    conversationWith: CometChat.User | CometChat.Group;
}

const Header: React.FunctionComponent<HeaderProps> = ({ icon, name, conversationType, conversationWith }) => {
    const { onStartCall, onInitiateGroupCall } = useCallContext();
    return (
        <AppBar position="static" sx={{ mx: "-2" }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Avatar alt={name} src={icon} />
                    <Typography
                        variant="body1"
                        noWrap
                        component="div"
                        sx={{ ml: 2, display: { xs: "none", md: "flex" } }}
                    >
                        {name}
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: "flex" }} />
                    {conversationType === "user" && (
                        <IconButton onClick={() => onStartCall(conversationWith as CometChat.User)}>
                            <Call />
                        </IconButton>
                    )}
                    {conversationType === "group" && (
                        <IconButton onClick={() => onInitiateGroupCall(conversationWith as CometChat.Group)}>
                            <VideoCall />
                        </IconButton>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
};

const Conversation = () => {
    const {
        conversation,
        isLoading,
        messages,
        sendMessage,
        isSendingMessage,
        fetchPrevMessages,
        newConversationReceiver,
    } = useActiveConversationContext();
    const [inputMessage, setInputMessage] = React.useState("");
    const [inputFile, setInputFile] = React.useState<any>(null);

    if (!conversation && !newConversationReceiver)
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

    const conversationWith = (conversation?.getConversationWith() || newConversationReceiver)!;
    const conversationType =
        conversation?.getConversationType() || (newConversationReceiver instanceof CometChat.User ? "user" : "group");

    const icon =
        conversationType === "group"
            ? (conversationWith as CometChat.Group).getIcon()
            : (conversationWith as CometChat.User).getAvatar();
    const receiverId =
        conversationType === "group"
            ? (conversationWith as CometChat.Group).getGuid()
            : (conversationWith as CometChat.User).getUid();

    const onSendMessage = async () => {
        if (inputFile) {
            const messageType = CometChat.MESSAGE_TYPE.FILE;
            // File type
            await sendMessage(new CometChat.MediaMessage(receiverId, inputFile, messageType, conversationType));
            setInputFile(null);
            return;
        }

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
            <Header
                conversationType={conversationType}
                conversationWith={conversationWith}
                icon={icon}
                name={conversationWith.getName()}
            />
            <Box
                sx={() => ({
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    px: 2,
                })}
            >
                <Box sx={{ flexGrow: 1, maxHeight: "58vh", overflowY: "scroll", p: 2 }}>
                    {messages.length === 0 ? (
                        <Typography
                            variant="h6"
                            sx={{
                                mt: 2,
                                textAlign: "center",
                            }}
                        >
                            This is the starting of your conversation with {conversationWith.getName()}
                        </Typography>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={() => {
                                fetchPrevMessages();
                            }}
                            sx={{
                                mb: 2,
                            }}
                        >
                            Load More - currently loaded - {messages.length}
                        </Button>
                    )}

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
                    disabled={isSendingMessage || Boolean(inputFile)}
                    onChange={(e) => {
                        setInputMessage(e.target.value);
                    }}
                    onFocus={() => {
                        // Send typing even
                        const receiverType =
                            conversationType === "user" ? CometChat.RECEIVER_TYPE.USER : CometChat.RECEIVER_TYPE.GROUP;
                        const typingNotification = new CometChat.TypingIndicator(receiverId, receiverType);
                        CometChat.startTyping(typingNotification);
                    }}
                    onBlur={() => {
                        const receiverType =
                            conversationType === "user" ? CometChat.RECEIVER_TYPE.USER : CometChat.RECEIVER_TYPE.GROUP;
                        const typingNotification = new CometChat.TypingIndicator(receiverId, receiverType);
                        CometChat.endTyping(typingNotification);
                    }}
                />
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mt: 1,
                    }}
                >
                    {inputFile ? (
                        <Typography>{inputFile.name}</Typography>
                    ) : (
                        <TextField
                            disabled={inputMessage.length > 0}
                            name="upload-photo"
                            type="file"
                            onChange={(e) => {
                                // @ts-ignore
                                const files = Array.from(e.target.files);
                                setInputFile(files[0]);
                            }}
                        />
                    )}
                    <IconButton
                        onClick={() => {
                            setInputFile(null);
                        }}
                    >
                        <DeleteForever />
                    </IconButton>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        p: 2,
                    }}
                >
                    <Button disabled={isSendingMessage} variant="contained" onClick={onSendMessage}>
                        Send Message/File
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default Conversation;
