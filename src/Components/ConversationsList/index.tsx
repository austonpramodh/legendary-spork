/* eslint-disable */
import { CometChat } from "@cometchat-pro/chat";
import { Box, Typography } from "@mui/material";
import React from "react";
import { MyCometChat } from "../../CometChat";
import { useAuthContext } from "../../Contexts/Auth";


interface ConversationProps {
    name: string;
    uid: string;
    isTyping: boolean
    onClick?: (uid: string) => void
}

const Conversation: React.FunctionComponent<ConversationProps> = ({ uid, name, isTyping, onClick }) => {
    return (
    <Box 
    height="64px" 
    padding="8px" 
    marginBottom={"4px"} 
    bgcolor={"grey"} 
    onClick={() => onClick ? onClick(uid) : null}
    >
        <Typography variant="subtitle1">
            {name}
        </Typography>
        <Typography variant="caption">
            {isTyping ? "Typing..." : ""}
        </Typography>
    </Box>)
}
const ConversationsList = () => {
    const [usersList, setUsersList] = React.useState<CometChat.User[]>([]);
    const [groupsList, setGroupsList] = React.useState<CometChat.Group[]>([]);

    const [typingUsers, setTypingUsers] = React.useState<Record<string, boolean>>({})

    const {
        values: { uid },
    } = useAuthContext();

    React.useEffect(() => {
        if (!uid)
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
                sender : CometChat.User,
                receiverId: string;
                receiverType: string
        }

        MyCometChat.addMessageListener(
            listenerId,
            new MyCometChat.MessageListener({
                onTypingStarted: (typingIndicator :TypingIndicator ) => {
                    if(typingIndicator.receiverId.toLowerCase() === uid.toLowerCase())
                    // Only update states if the typing is for me
                    setTypingUsers((typingUsers) => ({
                        ...typingUsers,
                        [typingIndicator.sender.getUid()]: true
                    }))
                },
                onTypingEnded: (typingIndicator : TypingIndicator)  => {
                    if(typingIndicator.receiverId.toLowerCase() === uid.toLowerCase())
                    setTypingUsers((typingUsers) => ({
                        ...typingUsers,
                        [typingIndicator.sender.getUid()]: false
                    }))
                }
            })
        );

        return () => {
            MyCometChat.removeMessageListener(listenerId)
        }
    }, [uid]);

    return (
        <Box
            display="flex"
            width="30%"
            flexDirection="column"
            borderRight={"1px solid black"}
            py={"8px"}
        >
            <Typography variant="h4" textAlign={"center"}>Users</Typography>
            {usersList.map((u) => {
                return (
                    <Conversation key={u.getUid()} isTyping={typingUsers[u.getUid()] || false} name={u.getName()} uid={u.getUid()} />
                );
            })}

            {/* <Typography variant="h5">Groups</Typography>
            {groupsList.map((g) => {
                return (
                    <Conversation key={g.getGuid()} isTyping={false} name={g.getName()} uid={g.getGuid()} />
                );
            })} */}
        </Box>
    );
};

export default ConversationsList;
