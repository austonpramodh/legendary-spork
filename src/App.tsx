import React from "react";
import { Container, CssBaseline, Paper } from "@mui/material";
import { initCometChat } from "./CometChat";
import UserLoginModal from "./Components/UserLoginModal";
import { AuthContextProvider } from "./Contexts/Auth";
import ConversationsList from "./Components/ConversationsList";
import { ConversationsListContextProvider } from "./Contexts/Conversation";
import AppBar from "./Components/AppBar";
import Conversation from "./Components/Conversation";
import { ActiveConversationContextProvider } from "./Contexts/ActiveConversation";
import { CallContextProvider } from "./Contexts/CallContext";
import CallScreen from "./Components/CallScreen";
import { UsersGroupsListContextProvider } from "./Contexts/UsersGroups";

const App: React.FunctionComponent = () => {
    React.useEffect(() => {
        initCometChat();
    }, []);

    return (
        <React.Fragment>
            <CssBaseline />
            <AuthContextProvider>
                <UsersGroupsListContextProvider>
                    <ConversationsListContextProvider>
                        <ActiveConversationContextProvider>
                            <CallContextProvider>
                                <CallScreen>
                                    <AppBar />
                                    <Container component="main" maxWidth="lg">
                                        <UserLoginModal />
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                my: { xs: 3, md: 6 },
                                                minHeight: "80vh",
                                                display: "flex",
                                            }}
                                        >
                                            <ConversationsList />
                                            <Conversation />
                                        </Paper>
                                    </Container>
                                </CallScreen>
                            </CallContextProvider>
                        </ActiveConversationContextProvider>
                    </ConversationsListContextProvider>
                </UsersGroupsListContextProvider>
            </AuthContextProvider>
        </React.Fragment>
    );
};

export default App;
