/* eslint-disable no-unused-vars */
import { CometChat } from "@cometchat-pro/chat";
import React from "react";
import { useAuthContext } from "./Auth";
import { useConversationsListContext } from "./Conversation";

interface ActiveConversationContextData {
    isLoading: boolean;
    error: unknown;
    conversation: CometChat.Conversation | null;
    messages: CometChat.BaseMessage[];
    onSelectConversation: (convo: CometChat.Conversation) => void;
    sendMessage: (msg: CometChat.BaseMessage) => void | Promise<void>;
    isSendingMessage: boolean;
    fetchPrevMessages: () => void;
    newConversationReceiver: null | CometChat.User | CometChat.Group;
    onNewConversation: (receiver: CometChat.User | CometChat.Group) => void;
    onClear: () => void;
}

const initialState: ActiveConversationContextData = {
    isLoading: false,
    error: null,
    conversation: null,
    messages: [],
    onSelectConversation: () => {},
    sendMessage: () => {},
    isSendingMessage: false,
    fetchPrevMessages: () => {},
    newConversationReceiver: null,
    onNewConversation: () => {},
    onClear: () => {},
};

const ActiveConversationContext = React.createContext(initialState);

export const useActiveConversationContext = () =>
    React.useContext<ActiveConversationContextData>(ActiveConversationContext);

export const ActiveConversationContextProvider: React.FunctionComponent = ({ children }) => {
    const [state, setState] =
        React.useState<Omit<ActiveConversationContextData, "onSelectConversation" | "sendMessage">>(initialState);

    const conversationClassRef = React.useRef<CometChat.MessagesRequest | null>(null);

    const authState = useAuthContext();
    const { onMessageHandleConversationsListUpdate, conversationsList } = useConversationsListContext();

    const onClear = () => setState(initialState);

    const onSelectConversation = (convo: CometChat.Conversation) => {
        if (state.conversation?.getConversationId() === convo.getConversationId()) return;
        // Mark all messages as read
        setState((prevState) => ({
            ...prevState,
            isLoading: true,
            conversation: convo,
            error: null,
            messages: [],
            newConversationReceiver: null,
        }));

        conversationClassRef.current = null;

        // Mark as the messages are read
        // Trigger fetch conversation complete
    };

    const fetchPrevMessages = async (initialFetch?: boolean) => {
        const { conversation } = state;
        if (!conversation) return;
        if (!conversationClassRef.current) {
            const limit = 30;
            let messagesRequest = new CometChat.MessagesRequestBuilder().setLimit(limit);

            if (conversation.getConversationType() === "user")
                messagesRequest = messagesRequest.setUID(
                    (conversation.getConversationWith() as CometChat.User).getUid(),
                );
            // Group message
            else
                messagesRequest = messagesRequest.setGUID(
                    (conversation.getConversationWith() as CometChat.Group).getGuid(),
                );

            conversationClassRef.current = messagesRequest.build();
        }

        conversationClassRef.current.fetchPrevious().then(
            (messages) => {
                // MArk everyting delivered and read when opened for the first time
                if (initialFetch && messages.length > 0) {
                    const lastMessage = messages[messages.length - 1];
                    CometChat.markAsDelivered(lastMessage);
                    CometChat.markAsRead(lastMessage);
                }

                console.log(messages);
                setState((prevState) => ({
                    ...prevState,
                    isLoading: false,
                    messages: [...messages, ...prevState.messages],
                }));
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

    const sendMessage = async (msg: CometChat.BaseMessage) => {
        setState((prevState) => ({
            ...prevState,
            isSendingMessage: true,
            error: null,
        }));

        try {
            const sentMessage = await CometChat.sendMessage(msg);
            setState((prevState) => {
                return {
                    ...prevState,
                    messages: [...prevState.messages, sentMessage],
                    isSendingMessage: false,
                };
            });
            // Swicth the active conversation to new one if its new user conversation
            if (state.newConversationReceiver) {
                CometChat.CometChatHelper.getConversationFromMessage(sentMessage)
                    .then((convo) => {
                        onSelectConversation(convo);
                    })
                    .catch((err) => {
                        console.log("Error occured while getting convo -", err);
                        setState(initialState);
                    });
            }

            onMessageHandleConversationsListUpdate(sentMessage);
        } catch (error) {
            setState((prevState) => ({
                ...prevState,
                isSendingMessage: false,
                error,
            }));
        }
    };

    React.useEffect(() => {
        // Subscribe to messages only after login
        if (!authState.values.user || !state.conversation) {
            return;
        }

        fetchPrevMessages(true);
        // Subscribe to the conversations for new messages!
        // Mark message as delivered
        const messageListerId = "message_listener_id2";
        CometChat.addMessageListener(
            messageListerId,
            new CometChat.MessageListener({
                onTextMessageReceived: (textMessage: CometChat.TextMessage) => {
                    // Get the conversation from message, and attach it the conversation list for last message
                    console.log("Text message received successfully", textMessage);
                    CometChat.markAsDelivered(textMessage);
                    // Check if message is for the active conversation, else ignore
                    if (textMessage.getConversationId() === state.conversation?.getConversationId()) {
                        setState((prevState) => ({
                            ...prevState,
                            messages: [...prevState.messages, textMessage],
                        }));
                        CometChat.markAsRead(textMessage);
                    }
                },
                onMediaMessageReceived: (mediaMessage: CometChat.MediaMessage) => {
                    console.log("Media message received successfully", mediaMessage);
                    CometChat.markAsDelivered(mediaMessage);
                    if (mediaMessage.getConversationId() === state.conversation?.getConversationId()) {
                        setState((prevState) => ({
                            ...prevState,
                            messages: [...prevState.messages, mediaMessage],
                        }));
                        CometChat.markAsRead(mediaMessage);
                    }
                },
                onCustomMessageReceived: (customMessage: CometChat.CustomMessage) => {
                    console.log("Custom message received successfully", customMessage);
                    CometChat.markAsDelivered(customMessage);
                    if (customMessage.getConversationId() === state.conversation?.getConversationId()) {
                        setState((prevState) => ({
                            ...prevState,
                            messages: [...prevState.messages, customMessage],
                        }));
                        CometChat.markAsRead(customMessage);
                    }
                },
                onMessagesDelivered: (messageReceipt: CometChat.MessageReceipt) => {
                    console.log("MessageDeliverd", { messageReceipt });
                    setState((prevState) => ({
                        ...prevState,
                        messages: prevState.messages.map((m) => {
                            if (`${m.getId()}` === messageReceipt.getMessageId()) {
                                m.setDeliveredAt(messageReceipt.getDeliveredAt());
                            }

                            return m;
                        }),
                    }));
                },
                onMessagesRead: (messageReceipt: CometChat.MessageReceipt) => {
                    console.log("MessageRead", { messageReceipt });
                    setState((prevState) => ({
                        ...prevState,
                        messages: prevState.messages.map((m) => {
                            if (`${m.getId()}` === messageReceipt.getMessageId()) {
                                console.log("Found message!!");
                                // M.setDeliveredAt(messageReceipt.getDeliveredAt());
                                m.setReadAt(messageReceipt.getReadAt());
                            }

                            return m;
                        }),
                    }));
                },
            }),
        );

        return () => {
            CometChat.removeMessageListener(messageListerId);
        };
    }, [authState.values.user, state.conversation]);

    const onNewConversation = (receiver: CometChat.User | CometChat.Group) => {
        // Check if the conversation already exists, if it does select that
        const foundConversation = conversationsList.find((convo) => {
            const convoWith = convo.getConversationWith();
            const id =
                convoWith instanceof CometChat.Group
                    ? (convo.getConversationWith() as CometChat.Group).getGuid()
                    : (convo.getConversationWith() as CometChat.User).getUid();
            const receiverId = receiver instanceof CometChat.User ? receiver.getUid() : receiver.getGuid();
            return id === receiverId;
        });

        console.log(foundConversation);
        if (foundConversation) return onSelectConversation(foundConversation);
        // Add it to state
        setState((prevState) => ({
            ...prevState,
            newConversationReceiver: receiver,
            conversation: null,
            error: null,
            isLoading: false,
            isSendingMessage: false,
            messages: [],
        }));
    };

    return (
        <ActiveConversationContext.Provider
            value={{ ...state, onSelectConversation, sendMessage, fetchPrevMessages, onNewConversation, onClear }}
        >
            {children}
        </ActiveConversationContext.Provider>
    );
};
