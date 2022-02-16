import { CometChat } from "@cometchat-pro/chat";
import React from "react";
import { useAuthContext } from "./Auth";

interface ConversationsListContextData {
    isLoading: boolean;
    error: unknown;
    conversationsList: CometChat.Conversation[];
    typingUsers: Record<string, boolean>;
    // eslint-disable-next-line no-unused-vars
    onMessageHandleConversationsListUpdate: (msg: CometChat.BaseMessage) => void;
}

const initialState: ConversationsListContextData = {
    isLoading: false,
    error: null,
    conversationsList: [],
    typingUsers: {},
    onMessageHandleConversationsListUpdate: () => {},
};

const ConversationsListContext = React.createContext(initialState);

export const useConversationsListContext = () => React.useContext(ConversationsListContext);

export const ConversationsListContextProvider: React.FunctionComponent = ({ children }) => {
    const [state, setState] =
        React.useState<Pick<ConversationsListContextData, "conversationsList" | "error" | "isLoading" | "typingUsers">>(
            initialState,
        );

    const {
        values: { user },
    } = useAuthContext();

    const onMessageHandleConversationsListUpdate = (msg: CometChat.BaseMessage) => {
        CometChat.CometChatHelper.getConversationFromMessage(msg).then(
            (conversation) => {
                console.log("Conversation Object", conversation);

                setState((prevState) => {
                    const newConversationsList = [conversation, ...prevState.conversationsList];
                    // Update on the conversationList else add to conversationList

                    // Dedupe the newConversationsList to have uniqueness

                    const dedupeMap = new Map<string, boolean>();
                    // Const oldConvIndex = state.conversationsList.findIndex((oldConv) => oldConv.getConversationId() === conversation.getConversationId());
                    // Convo found, update it
                    const dedupedConversationsList = newConversationsList.reduce<CometChat.Conversation[]>(
                        (prevValue, currentValue) => {
                            const id = currentValue.getConversationId();

                            if (dedupeMap.get(id))
                                // Duplicate
                                return prevValue;

                            dedupeMap.set(id, true);
                            prevValue.push(currentValue);
                            return prevValue;
                        },
                        [],
                    );
                    return {
                        ...prevState,
                        conversationsList: dedupedConversationsList,
                    };
                });
            },
            (error) => {
                console.log("Error while converting message object", error);
            },
        );
    };

    React.useEffect(() => {
        if (!user) return;
        // Fetch the conversations
        const limit = 30;
        const conversationRequest = new CometChat.ConversationsRequestBuilder()
            .setLimit(limit)
            .withUserAndGroupTags(true)
            .build();

        conversationRequest
            .fetchNext()
            .then((response) => {
                setState((prevState) => ({
                    ...prevState,
                    conversationsList: response,
                }));
            })
            .catch(console.log);

        interface TypingIndicator {
            sender: CometChat.User;
            receiverId: string;
            receiverType: string;
        }

        // Subscribe to the conversations for new messages!
        const messageListerId = "my_unique_message_listener_id";
        // Console.log("registering listener --", messageListerId);
        CometChat.addMessageListener(
            messageListerId,
            new CometChat.MessageListener({
                onTextMessageReceived: (textMessage: CometChat.TextMessage) => {
                    // Get the conversation from message, and attach it the conversation list for last message
                    console.log("Text message received successfully", textMessage);
                    onMessageHandleConversationsListUpdate(textMessage);
                },
                onMediaMessageReceived: (mediaMessage: CometChat.MediaMessage) => {
                    console.log("Media message received successfully", mediaMessage);
                    onMessageHandleConversationsListUpdate(mediaMessage);
                },
                onCustomMessageReceived: (customMessage: CometChat.CustomMessage) => {
                    console.log("Custom message received successfully", customMessage);
                    onMessageHandleConversationsListUpdate(customMessage);
                },
                onTypingStarted: (typingIndicator: TypingIndicator) => {
                    console.log("Typing started --- ", typingIndicator);
                    if (typingIndicator.receiverId.toLowerCase() === user.getUid().toLowerCase())
                        // Only update states if the typing is for me
                        setState((prevState) => ({
                            ...prevState,
                            typingUsers: {
                                ...prevState.typingUsers,
                                [`${typingIndicator.receiverId}-${typingIndicator.sender.getUid()}`]: true,
                            },
                        }));
                    // Receiver is the group
                    else
                        setState((prevState) => ({
                            ...prevState,
                            typingUsers: {
                                ...prevState.typingUsers,
                                [`${typingIndicator.receiverId}}`]: true,
                            },
                        }));
                },
                onTypingEnded: (typingIndicator: TypingIndicator) => {
                    console.log("Typing ended --- ", typingIndicator);
                    if (typingIndicator.receiverId.toLowerCase() === user.getUid().toLowerCase())
                        setState((prevState) => ({
                            ...prevState,
                            typingUsers: {
                                ...prevState.typingUsers,
                                [`${typingIndicator.receiverId}-${typingIndicator.sender.getUid()}`]: false,
                            },
                        }));
                    // Receiver is the group
                    else
                        setState((prevState) => ({
                            ...prevState,
                            typingUsers: {
                                ...prevState.typingUsers,
                                [`${typingIndicator.receiverId}}`]: false,
                            },
                        }));
                },
            }),
        );
        return () => {
            CometChat.removeMessageListener(messageListerId);
            console.log("removed listener for typing indicator");
        };
    }, [user]);

    return (
        <ConversationsListContext.Provider value={{ ...state, onMessageHandleConversationsListUpdate }}>
            {children}
        </ConversationsListContext.Provider>
    );
};
