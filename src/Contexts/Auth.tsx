import { CometChat } from "@cometchat-pro/chat";
import React from "react";
import { authKey, MyCometChat } from "../CometChat";

interface AuthContextData {
    values: { isLoading: boolean; error: unknown; user: CometChat.User | null };
    // eslint-disable-next-line no-unused-vars
    onLogin: (value: string) => void;
    onLogout: () => void;
}

const initialState: AuthContextData = {
    values: {
        isLoading: false,
        error: null,
        user: null,
    },
    onLogin: () => {},
    onLogout: () => {},
};

const AuthContext = React.createContext(initialState);

export const useAuthContext = () => React.useContext(AuthContext);

export const AuthContextProvider: React.FunctionComponent = ({ children }) => {
    const [state, setState] = React.useState<AuthContextData["values"]>(initialState.values);

    React.useEffect(() => {
        // Check for uid in localstorage
        const uid = localStorage.getItem("uid");
        if (uid) {
            // Already logged in
            setTimeout(() => onLogin(uid), 200);
        }
    }, []);

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
            localStorage.setItem("uid", uid);
        } catch (error) {
            console.error(error);
            setState({
                user: null,
                isLoading: false,
                error,
            });
        }
    };

    const onLogout = async () => {
        try {
            await MyCometChat.logout();
            setState({
                user: null,
                isLoading: true,
                error: null,
            });
        } catch (error) {
            console.error(error);
            setState(() => ({
                user: null,
                isLoading: false,
                error,
            }));
        }
    };

    return <AuthContext.Provider value={{ values: state, onLogin, onLogout }}>{children}</AuthContext.Provider>;
};
