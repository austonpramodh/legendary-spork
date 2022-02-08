import React from "react";
import { authKey, MyCometChat } from "../CometChat";

interface AuthContextData {
    values: { uid: string | null; isLoading: boolean; error: unknown };
    // eslint-disable-next-line no-unused-vars
    onLogin: (value: string) => void;
}

const initialState: AuthContextData = {
    values: {
        uid: null,
        isLoading: false,
        error: null,
    },
    onLogin: () => {},
};

const AuthContext = React.createContext(initialState);

export const useAuthContext = () => React.useContext(AuthContext);

export const AuthContextProvider: React.FunctionComponent = ({ children }) => {
    const [state, setState] = React.useState<AuthContextData["values"]>(initialState.values);

    const onLogin = async (uid: string) => {
        setState({
            uid: null,
            isLoading: true,
            error: null,
        });

        try {
            const response = await MyCometChat.login(uid, authKey);
            console.log(response);
            setState({
                uid,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            console.error(error);
            setState({
                uid: null,
                isLoading: false,
                error,
            });
        }
    };

    return <AuthContext.Provider value={{ values: state, onLogin }}>{children}</AuthContext.Provider>;
};
