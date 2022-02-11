import React from "react";
import { MyCometChat } from "../CometChat";
import { useAuthContext } from "./Auth";

interface ConversationContextData {
    values: {
        isLoading: boolean;
        error: unknown;
        selectedConversationUid: null | string;
    };
    // eslint-disable-next-line no-unused-vars
    onConversationSelect: (uid: string) => void;
}

const initialState: ConversationContextData = {
    values: {
        isLoading: false,
        error: null,
        selectedConversationUid: null,
    },
    // eslint-disable-next-line no-unused-vars
    onConversationSelect: (uid: string) => {},
};

const ConversationContext = React.createContext(initialState);

export const useConversationContext = () => React.useContext(ConversationContext);

export const ConversationContextProvider: React.FunctionComponent = ({ children }) => {
    const [state, setState] = React.useState<ConversationContextData["values"]>(initialState.values);

    const authState = useAuthContext();

    React.useEffect(() => {
        if (authState.values.user) {
            const limit = 30;
            const conversationType = "user";
            const conversationRequest = new MyCometChat.ConversationsRequestBuilder()
                .setLimit(limit)
                .setConversationType(conversationType)
                .withUserAndGroupTags(true)
                .build();

            conversationRequest
                .fetchNext()
                .then((d) => console.log("res", d))
                .catch((e) => console.log(e));
        }
    }, [authState.values.user]);

    const onConversationSelect = async (uid: string) => {
        setState((prevState) => ({
            ...prevState,
            selectedConversationUid: uid,
            isLoading: true,
        }));
        const limit = 30;
        const conversationType = "user";
        const conversationRequest = new MyCometChat.ConversationsRequestBuilder()
            .setLimit(limit)
            .setConversationType(conversationType)
            .withUserAndGroupTags(true)
            .build();

        const res = await conversationRequest.fetchNext();
        console.log(res);
        // Load all teh messages
        // Set it on the state
        // set Loading false
        setState((prevState) => ({
            ...prevState,
            isLoading: false,
        }));
    };

    return (
        <ConversationContext.Provider value={{ values: state, onConversationSelect }}>
            {children}
        </ConversationContext.Provider>
    );
};
