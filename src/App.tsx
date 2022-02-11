/* eslint-disable */
import React from "react";
import { Button, Container, CssBaseline, Paper } from "@mui/material";
import { initCometChat, MyCometChat } from "./CometChat";
import UserLoginModal from "./Components/UserLoginModal";
import { AuthContextProvider } from "./Contexts/Auth";
import ConversationsList from "./Components/ConversationsList";
import { ConversationContextProvider } from "./Contexts/Conversation";

const App: React.FunctionComponent = () => {
    React.useEffect(() => {
        initCometChat();
    }, []);

    return (
        <React.Fragment>
            <CssBaseline />
            <AuthContextProvider>
                <ConversationContextProvider>
                    <Container component="main" maxWidth="lg"
                    >
                        <UserLoginModal />
                        <Paper variant="outlined"
                            sx={{
                                my: { xs: 3, md: 6 },
                                minHeight: "85vh"
                            }}>
                            <ConversationsList />
                        </Paper>
                    </Container>
                </ConversationContextProvider>
            </AuthContextProvider>
        </React.Fragment>
    );
};

export default App;
