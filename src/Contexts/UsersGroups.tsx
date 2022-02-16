import { CometChat } from "@cometchat-pro/chat";
import React from "react";
import { useAuthContext } from "./Auth";

interface UsersGroupsListContextData {
    isLoading: boolean;
    error: unknown;
    users: CometChat.User[];
    groups: CometChat.Group[];
}

const initialState: UsersGroupsListContextData = {
    isLoading: false,
    error: null,
    users: [],
    groups: [],
};

const UsersGroupsListContext = React.createContext(initialState);

export const useUsersGroupsListContext = () => React.useContext(UsersGroupsListContext);

export const UsersGroupsListContextProvider: React.FunctionComponent = ({ children }) => {
    const [state, setState] =
        React.useState<Pick<UsersGroupsListContextData, "groups" | "error" | "isLoading" | "users">>(initialState);

    const {
        values: { user },
    } = useAuthContext();

    React.useEffect(() => {
        if (!user) return;
        // Fetch the conversations
        const limit = 30;
        const usersRequest = new CometChat.UsersRequestBuilder().setLimit(limit).build();

        usersRequest.fetchNext().then((userList) => {
            setState((prevState) => ({
                ...prevState,
                users: userList,
                isLoading: false,
                error: null,
            }));
        });

        const groupsRequest = new CometChat.GroupsRequestBuilder().setLimit(limit).build();

        groupsRequest.fetchNext().then((groupList) => {
            setState((prevState) => ({
                ...prevState,
                isLoading: false,
                error: null,
                groups: groupList,
            }));
        });
        return () => {};
    }, [user]);

    return <UsersGroupsListContext.Provider value={{ ...state }}>{children}</UsersGroupsListContext.Provider>;
};
