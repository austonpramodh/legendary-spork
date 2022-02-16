import { CometChat } from "@cometchat-pro/chat";
import { Box, Button, Link, Typography } from "@mui/material";
import React from "react";
import { useCallContext } from "../../Contexts/CallContext";

interface Props {
    messages: CometChat.BaseMessage[];
}

const Messages: React.FunctionComponent<Props> = ({ messages }) => {
    const messageBoxRef = React.useRef<HTMLDivElement>(null);
    const { onAcceptGroupCall } = useCallContext();

    const scrollToBottom = () => {
        messageBoxRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        setTimeout(scrollToBottom, 300);
    }, [messages.length]);

    const renderMessage = (message: CometChat.BaseMessage) => {
        const from = message.getSender();
        const messageType = message.getType();
        if (messageType === "text") {
            const textMessage = message as CometChat.TextMessage;
            // Const deliveredAt = new Date(textMessage.getDeliveredAt());
            return (
                <Typography>
                    <Typography variant="subtitle2" component={"span"}>
                        {from.getName()}:{" "}
                    </Typography>
                    {textMessage.getText()}
                </Typography>
            );
        }

        if (messageType === "file") {
            const mediaMessage = message as CometChat.MediaMessage;
            return (
                <Typography
                    component="div"
                    sx={{
                        display: "flex",
                        // JustifyContent: "center",
                        alignItems: "flex-start",
                    }}
                >
                    <Typography variant="subtitle2" component={"span"}>
                        {from.getName()}:{" "}
                    </Typography>

                    <Link href={mediaMessage.getURL()} variant="body2" target={"_blank"}>
                        {mediaMessage.getAttachment().getMimeType().startsWith("image") ? (
                            <Box
                                sx={{
                                    ml: 2,
                                }}
                            >
                                <img
                                    src={mediaMessage.getURL()}
                                    width="100px"
                                    height="100px"
                                    style={{
                                        maxWidth: 100,
                                        height: "auto",
                                    }}
                                />
                            </Box>
                        ) : (
                            mediaMessage.getAttachment().getName()
                        )}
                    </Link>
                </Typography>
            );
        }

        if (messageType === "meeting") {
            console.log("meeting---", message);
            const meetingMessage = message as CometChat.CustomMessage;
            const customData = meetingMessage.getData().customData as {
                callType: "video";
                sessionID: string;
                sessionId: string;
            };
            return (
                <Typography>
                    <Typography variant="subtitle2" component={"span"}>
                        {from.getName()}:{" "}
                    </Typography>
                    has initiated a meeting -{" "}
                    <Button
                        variant="contained"
                        onClick={() => {
                            // Join the meeting
                            console.log("Join the meeting session --> ", customData.sessionId);
                            onAcceptGroupCall(customData.sessionId);
                        }}
                    >
                        Join Meeting
                    </Button>
                </Typography>
            );
        }

        return (
            <Typography color="red">
                <Typography variant="subtitle2" component={"span"}>
                    {from.getName()}:{" "}
                </Typography>
                Message type not integrated! - {message.getType()}
            </Typography>
        );
    };

    return (
        <>
            {messages.map((message, index) => {
                const isLastMessage = messages.length - 1 === index ? messageBoxRef : undefined;
                const id = message.getId();

                return (
                    <Box
                        sx={{ mb: isLastMessage ? 0 : 1 }}
                        key={`message-${id}`}
                        ref={isLastMessage ? messageBoxRef : undefined}
                    >
                        {renderMessage(message)}
                    </Box>
                );
            })}
        </>
    );
};

export default Messages;
