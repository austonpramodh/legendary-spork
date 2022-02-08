/* eslint-disable */
import React from "react";
import { Button, Container, CssBaseline, Paper } from "@mui/material";
import { initCometChat, MyCometChat } from "./CometChat";
import UserLoginModal from "./Components/UserLoginModal";
import { AuthContextProvider } from "./Contexts/Auth";
import ConversationsList from "./Components/ConversationsList";

const App: React.FunctionComponent = () => {
    React.useEffect(() => {
        initCometChat();
    }, []);

    const fetch = () => {
        const limit = 30;
        const usersRequest = new MyCometChat.UsersRequestBuilder().setLimit(limit).build();

        usersRequest.fetchNext().then(
            (userList) => {
                console.log("User list received:", userList);
            },
            (error) => {
                console.log("User list fetching failed with error:", error);
            },
        );
    };

    return (
        <React.Fragment>
            <CssBaseline />
            <AuthContextProvider>
                <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
                    <UserLoginModal />
                    <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 } }}>
                        <ConversationsList />
                        {/* <Button onClick={fetch}> fetch </Button> */}
                    </Paper>
                </Container>
            </AuthContextProvider>
        </React.Fragment>
    );
};

export default App;
