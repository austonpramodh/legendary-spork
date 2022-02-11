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
    // Typography,
} from "@mui/material";
import React from "react";
import { MyCometChat } from "../../CometChat";
import { useAuthContext } from "../../Contexts/Auth";

interface ConversationProps {
    // User: CometChat.User;
    isTyping: boolean;
    // eslint-disable-next-line no-unused-vars
    onClick?: (id: string) => void;
    name: string;
    avatar: string;
    id: string;
}

const Conversation: React.FunctionComponent<ConversationProps> = ({ isTyping, onClick, avatar, id, name }) => {
    return (
        <ListItem alignItems="flex-start" onClick={() => (onClick ? onClick(id) : null)}>
            <ListItemAvatar>
                <Avatar alt={name} src={avatar} />
            </ListItemAvatar>
            <ListItemText
                primary={name}
                secondary={
                    isTyping ? (
                        "Typing...."
                    ) : (
                        <React.Fragment>
                            {/* <Typography
                                sx={{ display: "inline" }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                            >
                                Ali Connors
                            </Typography> */}
                            {" - I'll be in your neighborhood doing errands this…"}
                        </React.Fragment>
                    )
                }
            />
        </ListItem>
    );
};

const ConversationsList = () => {
    const [usersList, setUsersList] = React.useState<CometChat.User[]>([]);

    const [groupsList, setGroupsList] = React.useState<CometChat.Group[]>([]);

    const [typingUsers, setTypingUsers] = React.useState<Record<string, boolean>>({});

    const {
        values: { user },
    } = useAuthContext();

    React.useEffect(() => {
        if (!user)
            // Not yet logged in
            return;

        const limit = 30;
        const usersRequest = new MyCometChat.UsersRequestBuilder().setLimit(limit).build();

        usersRequest.fetchNext().then(
            (userList) => {
                console.log("User list received:", userList);
                setUsersList(userList);
            },
            (error) => {
                console.log("User list fetching failed with error:", error);
            },
        );

        const groupsRequest = new MyCometChat.GroupsRequestBuilder().setLimit(limit).build();

        groupsRequest.fetchNext().then(
            (groupList) => {
                console.log("Groups list fetched successfully", groupList);
                setGroupsList(groupList);
            },
            (error) => {
                console.log("Groups list fetching failed with error", error);
            },
        );

        const listenerId = "UNIQUE_LITENER_ID";

        interface TypingIndicator {
            sender: CometChat.User;
            receiverId: string;
            receiverType: string;
        }

        MyCometChat.addMessageListener(
            listenerId,
            new MyCometChat.MessageListener({
                onTypingStarted: (typingIndicator: TypingIndicator) => {
                    if (typingIndicator.receiverId.toLowerCase() === user.getUid().toLowerCase())
                        // Only update states if the typing is for me
                        setTypingUsers((typingUsers) => ({
                            ...typingUsers,
                            [typingIndicator.sender.getUid()]: true,
                        }));
                },
                onTypingEnded: (typingIndicator: TypingIndicator) => {
                    if (typingIndicator.receiverId.toLowerCase() === user.getUid().toLowerCase())
                        setTypingUsers((typingUsers) => ({
                            ...typingUsers,
                            [typingIndicator.sender.getUid()]: false,
                        }));
                },
            }),
        );

        return () => {
            MyCometChat.removeMessageListener(listenerId);
        };
    }, [user?.getUid()]);

    if (!user) return null;

    return (
        <Box display="flex" width="30%" flexDirection="column">
            <List
                sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
                subheader={
                    <ListSubheader component="div" id="nested-list-subheader">
                        Users
                    </ListSubheader>
                }
            >
                {usersList.map((user, index) => {
                    return (
                        <Box key={user.getUid()}>
                            <Conversation
                                key={user.getUid()}
                                isTyping={typingUsers[user.getUid()] || false}
                                avatar={user.getAvatar()}
                                id={user.getUid()}
                                name={user.getName()}
                                onClick={(user) => {
                                    console.log("hello", user);
                                }}
                            />
                            {index + 1 !== usersList.length && <Divider variant="inset" component="li" />}
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
                {groupsList.map((group, index) => {
                    return (
                        <Box key={group.getGuid()}>
                            <Conversation
                                key={group.getGuid()}
                                isTyping={typingUsers[group.getGuid()] || false}
                                avatar={group.getIcon()}
                                id={group.getGuid()}
                                name={group.getName()}
                                onClick={() => {
                                    console.log("hello", group);
                                }}
                            />
                            {index + 1 !== groupsList.length && <Divider variant="inset" component="li" />}
                        </Box>
                    );
                })}
            </List>
        </Box>
    );
};

export default ConversationsList;
