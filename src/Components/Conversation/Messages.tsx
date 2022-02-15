import { CometChat } from "@cometchat-pro/chat";
import { Box, Typography } from "@mui/material";
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

    return (
        <>
            {messages.map((message, index) => {
                const id = message.getId();
                const isLastMessage = messages.length - 1 === index ? messageBoxRef : undefined;
                const from = message.getSender();

                if (message.getType() === "text") {
                    const textMessage = message as CometChat.TextMessage;
                    // Const deliveredAt = new Date(textMessage.getDeliveredAt());
                    return (
                        <Box
                            sx={{ mb: isLastMessage ? 0 : 1 }}
                            key={`message-${id}`}
                            ref={isLastMessage ? messageBoxRef : undefined}
                        >
                            <Typography>
                                <Typography variant="subtitle2" component={"span"}>
                                    {from.getName()}:{" "}
                                </Typography>
                                {textMessage.getText()}
                            </Typography>
                        </Box>
                    );
                }

                return (
                    <Box
                        sx={{ mb: isLastMessage ? 0 : 1 }}
                        key={`message-${id}`}
                        ref={isLastMessage ? messageBoxRef : undefined}
                    >
                        <Typography color="red">
                            <Typography variant="subtitle2" component={"span"}>
                                {from.getName()}:{" "}
                            </Typography>
                            Message type not integrated! - {message.getType()}
                        </Typography>
                    </Box>
                );
            })}
        </>
    );
};

export default Messages;
