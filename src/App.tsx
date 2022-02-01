import React from "react";
import { Container, CssBaseline, Paper, Typography } from "@mui/material";

const App: React.FunctionComponent = () => {
    const a = 10;
    console.log(a);

    return (
        <React.Fragment>
            <CssBaseline />
            <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
                <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                    {" "}
                    <Typography component="h1" variant="h4" align="center">
                        Checkout
                    </Typography>
                    <div>Hello world</div>
                </Paper>
            </Container>
        </React.Fragment>
    );
};

export default App;
