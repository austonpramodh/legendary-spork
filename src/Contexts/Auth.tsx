import { CometChat } from "@cometchat-pro/chat";
import React from "react";
import { authKey, MyCometChat } from "../CometChat";

interface AuthContextData {
    values: { isLoading: boolean; error: unknown; user: CometChat.User | null };
    // eslint-disable-next-line no-unused-vars
    onLogin: (value: string) => void;
}

const initialState: AuthContextData = {
    values: {
        isLoading: false,
        error: null,
        user: null,
    },
    onLogin: () => {},
};

const AuthContext = React.createContext(initialState);

export const useAuthContext = () => React.useContext(AuthContext);

export const AuthContextProvider: React.FunctionComponent = ({ children }) => {
    const [state, setState] = React.useState<AuthContextData["values"]>(initialState.values);

    const onLogin = async (uid: string) => {
        setState({
            user: null,
            isLoading: true,
            error: null,
        });

        try {
            const response = await MyCometChat.login(uid, authKey);
            setState({
                user: response,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            console.error(error);
            setState({
                user: null,
                isLoading: false,
                error,
            });
        }
    };

    return <AuthContext.Provider value={{ values: state, onLogin }}>{children}</AuthContext.Provider>;
};
