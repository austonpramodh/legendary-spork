/* eslint-disable no-unused-vars */
import { CometChat } from "@cometchat-pro/chat";
import {
    Avatar,
    Box,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListSubheader,
    Typography,
    // Typography,
} from "@mui/material";
import React from "react";
import { MyCometChat } from "../../CometChat";
import { useActiveConversationContext } from "../../Contexts/ActiveConversation";
import { useAuthContext } from "../../Contexts/Auth";
import { useConversationsListContext } from "../../Contexts/Conversation";

interface ConversationProps {
    // User: CometChat.User;
    isTyping: boolean;

    onClick?: (id: string) => void;
    name: string;
    avatar: string;
    id: string;
    hasUnreadMessage: boolean;
    lastMessage: string;
}

const Conversation: React.FunctionComponent<ConversationProps> = ({
    isTyping,
    onClick,
    avatar,
    id,
    name,
    hasUnreadMessage,
    lastMessage,
}) => {
    return (
        <ListItem alignItems="flex-start" onClick={() => (onClick ? onClick(id) : null)}>
            <ListItemAvatar>
                <Avatar alt={name} src={avatar} />
            </ListItemAvatar>
            <ListItemText
                primary={name}
                secondary={
                    isTyping ? (
                        <Typography
                            sx={{ display: "inline", fontWeight: 500 }}
                            component="span"
                            variant="body2"
                            color="text.secondary"
                        >
                            Typing....
                        </Typography>
                    ) : (
                        <React.Fragment>
                            {hasUnreadMessage ? (
                                <Typography
                                    sx={{ display: "inline", fontWeight: 500 }}
                                    component="span"
                                    variant="body2"
                                    color="text.primary"
                                >
                                    {lastMessage}
                                </Typography>
                            ) : (
                                lastMessage
                            )}
                        </React.Fragment>
                    )
                }
            />
        </ListItem>
    );
};

const ConversationsList = () => {
    const [typingUsers, setTypingUsers] = React.useState<Record<string, boolean>>({});

    const { conversationsList } = useConversationsListContext();

    const { onSelectConversation } = useActiveConversationContext();

    const {
        values: { user },
    } = useAuthContext();

    React.useEffect(() => {
        if (!user)
            // Not yet logged in
            return;

        const typingIndicatorListnerId = "typingIndicatorListnerId";

        interface TypingIndicator {
            sender: CometChat.User;
            receiverId: string;
            receiverType: string;
        }

        CometChat.addMessageListener(
            typingIndicatorListnerId,
            new CometChat.MessageListener({
                onTypingStarted: (typingIndicator: TypingIndicator) => {
                    console.log("Typing started --- ", typingIndicator);
                    if (typingIndicator.receiverId.toLowerCase() === user.getUid().toLowerCase())
                        // Only update states if the typing is for me
                        setTypingUsers((typingUsers) => ({
                            ...typingUsers,
                            [typingIndicator.sender.getUid()]: true,
                        }));
                },
                onTypingEnded: (typingIndicator: TypingIndicator) => {
                    console.log("Typing ended --- ", typingIndicator);
                    if (typingIndicator.receiverId.toLowerCase() === user.getUid().toLowerCase())
                        setTypingUsers((typingUsers) => ({
                            ...typingUsers,
                            [typingIndicator.sender.getUid()]: false,
                        }));
                },
            }),
        );

        return () => {
            CometChat.removeMessageListener(typingIndicatorListnerId);
        };
    }, [user?.getUid()]);

    if (!user) return null;

    return (
        <Box display="flex" width="30%" flexDirection="column">
            <List
                sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
                subheader={
                    <ListSubheader component="div" id="nested-list-subheader">
                        Conversations
                    </ListSubheader>
                }
            >
                {conversationsList.map((conversation, index) => {
                    const lastMessage =
                        conversation.getLastMessage().type === "text"
                            ? ((conversation.getLastMessage() as CometChat.TextMessage).getData().text as string)
                            : "Message Type not integrated!";
                    console.log(lastMessage);
                    const icon =
                        conversation.getConversationType() === "group"
                            ? (conversation.getConversationWith() as CometChat.Group).getIcon()
                            : (conversation.getConversationWith() as CometChat.User).getAvatar();
                    return (
                        <Box key={conversation.getConversationId()}>
                            <Conversation
                                key={conversation.getConversationId()}
                                isTyping={typingUsers[conversation.getConversationId()] || false}
                                avatar={icon}
                                id={conversation.getConversationId()}
                                name={conversation.getConversationWith().getName()}
                                onClick={() => {
                                    console.log("hello", conversation);
                                    onSelectConversation(conversation);
                                }}
                                hasUnreadMessage={conversation.getUnreadMessageCount() > 0}
                                lastMessage={lastMessage}
                            />
                            {index + 1 !== conversationsList.length && <Divider variant="inset" component="li" />}
                        </Box>
                    );
                })}
            </List>
        </Box>
    );
};

export default ConversationsList;
