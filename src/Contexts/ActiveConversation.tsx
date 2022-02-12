/* eslint-disable no-unused-vars */
import { CometChat } from "@cometchat-pro/chat";
import React from "react";
import { useAuthContext } from "./Auth";

interface ActiveConversationContextData {
    isLoading: boolean;
    error: unknown;
    conversation: CometChat.Conversation | null;
    messages: CometChat.BaseMessage[];
    onSelectConversation: (convo: CometChat.Conversation) => void;
    sendMessage: (msg: CometChat.TextMessage) => void | Promise<void>;
}

const initialState: ActiveConversationContextData = {
    isLoading: false,
    error: null,
    conversation: null,
    messages: [],
    onSelectConversation: () => {},
    sendMessage: () => {},
};

const ActiveConversationContext = React.createContext(initialState);

export const useActiveConversationContext = () =>
    React.useContext<ActiveConversationContextData>(ActiveConversationContext);

export const ActiveConversationContextProvider: React.FunctionComponent = ({ children }) => {
    const [state, setState] = React.useState<Omit<ActiveConversationContextData, "onSelectConversation">>(initialState);

    const authState = useAuthContext();

    const onSelectConversation = (convo: CometChat.Conversation) => {
        if (state.conversation?.getConversationId() === convo.getConversationId()) return;
        setState((prevState) => ({
            ...prevState,
            isLoading: true,
            conversation: convo,
            error: null,
            messages: [],
        }));

        // Mark as the messages are read
        // Trigger fetch conversation complete
    };

    const fetchMessages = async (conversation: CometChat.Conversation) => {
        const limit = 30;
        let messagesRequest = new CometChat.MessagesRequestBuilder().setLimit(limit);

        if (conversation.getConversationType() === "user")
            messagesRequest = messagesRequest.setUID((conversation.getConversationWith() as CometChat.User).getUid());
        // Group message
        else
            messagesRequest = messagesRequest.setGUID(
                (conversation.getConversationWith() as CometChat.Group).getGuid(),
            );

        messagesRequest
            .build()
            .fetchPrevious()
            .then(
                (messages) => {
                    setState((prevState) => ({
                        ...prevState,
                        isLoading: false,
                        messages,
                    }));
                    console.log("Message list fetched:", messages);
                },
                (error) => {
                    console.log("Message fetching failed with error:", error);
                    setState((prevState) => ({
                        ...prevState,
                        messages: [],
                        conversation: null,
                        isLoading: false,
                        error,
                    }));
                },
            );
    };

    const sendMessage = async (msg: CometChat.TextMessage) => {
        setState((prevState) => ({
            ...prevState,
            isLoading: true,
            error: null,
        }));

        try {
            const sentMessage = await CometChat.sendMessage(msg);
            setState((prevState) => {
                return {
                    ...prevState,
                    messages: [...prevState.messages, sentMessage],
                    isLoading: false,
                };
            });
        } catch (error) {
            setState((prevState) => ({
                ...prevState,
                isLoading: false,
                error,
            }));
        }
    };

    React.useEffect(() => {
        if (!authState.values.user) return;
        if (!state.conversation) return;

        fetchMessages(state.conversation);

        // Subscribe to the conversations for new messages!
        // Mark message as delivered
        // const messageListerId = "message_listener_id";
        // CometChat.addMessageListener(
        //     messageListerId,
        //     new CometChat.MessageListener({
        //         onTextMessageReceived: (textMessage: CometChat.TextMessage) => {
        //             // Get the conversation from message, and attach it the conversation list for last message
        //             console.log("Text message received successfully", textMessage);
        //             CometChat.markAsDelivered(message);
        //             CometChat.markAsRead(message)
        //         },
        //         onMediaMessageReceived: (mediaMessage: CometChat.MediaMessage) => {
        //             console.log("Media message received successfully", mediaMessage);
        //         },
        //         onCustomMessageReceived: (customMessage: CometChat.CustomMessage) => {
        //             console.log("Custom message received successfully", customMessage);
        //         },
        //     }),
        // );
        return () => {
            // CometChat.removeMessageListener(messageListerId);
        };
    }, [authState.values.user, state.conversation]);

    return (
        <ActiveConversationContext.Provider value={{ ...state, onSelectConversation, sendMessage }}>
            {children}
        </ActiveConversationContext.Provider>
    );
};
