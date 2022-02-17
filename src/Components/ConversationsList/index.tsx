/* eslint-disable no-unused-vars */
import { CometChat } from "@cometchat-pro/chat";
import { Delete, DeleteForever } from "@mui/icons-material";
import {
    Avatar,
    Box,
    Button,
    Divider,
    IconButton,
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
import { useUsersGroupsListContext } from "../../Contexts/UsersGroups";

interface ConversationProps {
    // User: CometChat.User;
    isTyping: boolean;

    onClick?: (id: string) => void;
    name: string;
    avatar: string;
    id: string;
    hasUnreadMessage: boolean;
    lastMessage: string | React.ReactNode;
    onDelete?: () => void;
}

const Conversation: React.FunctionComponent<ConversationProps> = ({
    isTyping,
    onClick,
    avatar,
    id,
    name,
    hasUnreadMessage,
    lastMessage,
    onDelete,
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
                            {onDelete && (
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        onDelete();
                                    }}
                                >
                                    <Delete sx={{ fontSize: 14 }} />
                                </IconButton>
                            )}
                        </React.Fragment>
                    )
                }
            />
        </ListItem>
    );
};

const getMessageText = (msg: CometChat.BaseMessage) => {
    const messageType = msg.getType();
    if (messageType === "text") {
        return (msg as CometChat.TextMessage).getData().text as string;
    }

    if (messageType === "file") {
        const typedMessage = msg as CometChat.MediaMessage;

        return `File - ${typedMessage.getAttachment().getName()}`;
    }

    return "Message Type not integrated!";
};

const ConversationsList = () => {
    const { conversationsList, typingUsers, onDeleteConversation } = useConversationsListContext();

    const { onSelectConversation, onNewConversation, onClear } = useActiveConversationContext();

    const { groups, users } = useUsersGroupsListContext();

    const {
        values: { user },
    } = useAuthContext();

    if (!user) return null;

    return (
        <Box
            display="flex"
            width="30%"
            flexDirection="column"
            // Sx={{
            //     backgroundColor: "yellow",
            // }}
        >
            <List
                sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
                subheader={
                    <ListSubheader component="div" id="nested-list-subheader">
                        Conversations
                    </ListSubheader>
                }
            >
                {conversationsList.length === 0 && (
                    <ListItem>
                        <ListItemText>
                            <Typography>No Conversations yet!</Typography>
                        </ListItemText>
                    </ListItem>
                )}
                {conversationsList.map((conversation, index) => {
                    const lastMessage = conversation.getLastMessage();
                    const lastMessageText = getMessageText(lastMessage);

                    const icon =
                        conversation.getConversationType() === "group"
                            ? (conversation.getConversationWith() as CometChat.Group).getIcon()
                            : (conversation.getConversationWith() as CometChat.User).getAvatar();
                    const id =
                        conversation.getConversationType() === "group"
                            ? (conversation.getConversationWith() as CometChat.Group).getGuid()
                            : (conversation.getConversationWith() as CometChat.User).getUid();

                    const typingKeyPrefix =
                        conversation.getConversationType() === "group"
                            ? (conversation.getConversationWith() as CometChat.Group).getGuid()
                            : user.getUid();
                    return (
                        <Box key={conversation.getConversationId()}>
                            <Conversation
                                key={conversation.getConversationId()}
                                isTyping={
                                    typingUsers[
                                        conversation.getConversationType() === "group"
                                            ? typingKeyPrefix
                                            : `${typingKeyPrefix}-${id}`
                                    ] || false
                                }
                                avatar={icon}
                                id={conversation.getConversationId()}
                                name={`${conversation.getConversationWith().getName()}`}
                                onClick={() => {
                                    onSelectConversation(conversation);
                                }}
                                onDelete={() => {
                                    onDeleteConversation(conversation);
                                    onClear();
                                }}
                                hasUnreadMessage={conversation.getUnreadMessageCount() > 0}
                                lastMessage={lastMessageText}
                            />
                            {index + 1 !== conversationsList.length && <Divider variant="inset" component="li" />}
                        </Box>
                    );
                })}
            </List>

            <List
                sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
                subheader={
                    <ListSubheader component="div" id="nested-list-subheader">
                        Users
                    </ListSubheader>
                }
            >
                {users.length === 0 && (
                    <ListItem>
                        <ListItemText>
                            <Typography>No Users!</Typography>
                        </ListItemText>
                    </ListItem>
                )}
                {users.map((user, index) => {
                    const icon = user.getAvatar();
                    const id = user.getUid();

                    return (
                        <Box key={id}>
                            <Conversation
                                isTyping={false}
                                avatar={icon}
                                id={id}
                                name={`${user.getName()}`}
                                onClick={() => {
                                    onNewConversation(user);
                                }}
                                hasUnreadMessage={false}
                                lastMessage={user.getStatusMessage()}
                            />
                            {index + 1 !== conversationsList.length && <Divider variant="inset" component="li" />}
                        </Box>
                    );
                })}
            </List>
            <List
                sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
                subheader={
                    <ListSubheader component="div" id="nested-list-subheader">
                        Groups
                    </ListSubheader>
                }
            >
                {groups.length === 0 && (
                    <ListItem>
                        <ListItemText>
                            <Typography>No Groups!</Typography>
                        </ListItemText>
                    </ListItem>
                )}
                {groups.map((group, index) => {
                    const icon = group.getIcon();
                    const id = group.getGuid();

                    return (
                        <Box key={id}>
                            <Conversation
                                isTyping={false}
                                avatar={icon}
                                id={id}
                                name={`${group.getName()}`}
                                onClick={() => {
                                    onNewConversation(group);
                                }}
                                hasUnreadMessage={false}
                                lastMessage={""}
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
