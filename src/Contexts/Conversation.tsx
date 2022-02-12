import { CometChat } from "@cometchat-pro/chat";
import React from "react";
import { useAuthContext } from "./Auth";

interface ConversationsListContextData {
    isLoading: boolean;
    error: unknown;
    conversationsList: CometChat.Conversation[];
}

const initialState: ConversationsListContextData = {
    isLoading: false,
    error: null,
    conversationsList: [],
};

const ConversationsListContext = React.createContext(initialState);

export const useConversationsListContext = () => React.useContext(ConversationsListContext);

export const ConversationsListContextProvider: React.FunctionComponent = ({ children }) => {
    const [state, setState] =
        React.useState<Pick<ConversationsListContextData, "conversationsList" | "error" | "isLoading">>(initialState);

    const authState = useAuthContext();

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
        if (!authState.values.user) return;
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

        // Subscribe to the conversations for new messages!
        const messageListerId = "message_listener_id";
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
            }),
        );
        return () => {
            CometChat.removeMessageListener(messageListerId);
        };
    }, [authState.values.user]);

    return <ConversationsListContext.Provider value={{ ...state }}>{children}</ConversationsListContext.Provider>;
};
