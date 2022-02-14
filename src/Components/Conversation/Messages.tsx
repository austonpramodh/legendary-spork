import { CometChat } from "@cometchat-pro/chat";
import { Box, Typography } from "@mui/material";
import React from "react";

interface Props {
    messages: CometChat.BaseMessage[];
}

const Messages: React.FunctionComponent<Props> = ({ messages }) => {
    const messageBoxRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        console.log(messageBoxRef);
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
                    <Box ref={isLastMessage ? messageBoxRef : undefined}>
                        <Typography key={`message-${id}`}>Unknown Type</Typography>;
                    </Box>
                );
            })}
        </>
    );
};

export default Messages;