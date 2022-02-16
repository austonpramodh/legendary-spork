import { CometChat } from "@cometchat-pro/chat";
import { Box, Link, Typography } from "@mui/material";
import React from "react";

interface Props {
    messages: CometChat.BaseMessage[];
}

const Messages: React.FunctionComponent<Props> = ({ messages }) => {
    const messageBoxRef = React.useRef<HTMLDivElement>(null);

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
            console.log(message);
            const mediaMessage = message as CometChat.MediaMessage;
            return (
                <Typography>
                    <Typography variant="subtitle2" component={"span"}>
                        {from.getName()}:{" "}
                    </Typography>
                    <Link href={mediaMessage.getURL()} variant="body2" target={"_blank"}>
                        {mediaMessage.getAttachment().getName()}
                    </Link>
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
