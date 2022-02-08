import { Box, Modal, Typography, TextField, Button } from "@mui/material";
import React from "react";
import { useAuthContext } from "../../Contexts/Auth";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
};

const UserLoginModal: React.FunctionComponent = () => {
    const [isModalOpen, setModalOpen] = React.useState(false);
    const [userID, setUserID] = React.useState("");

    const {
        onLogin,
        values: { uid, isLoading, error },
    } = useAuthContext();

    React.useEffect(() => {
        if (uid) {
            // User has logged in, because of which there is uid
            setModalOpen(false);
            return;
        }

        setModalOpen(true);
    }, [uid]);

    return (
        <Modal open={isModalOpen} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    User Login
                </Typography>
                <TextField
                    disabled={isLoading}
                    onChange={(e) => setUserID(e.target.value)}
                    sx={{ mt: 2, mx: 2 }}
                    id="outlined-basic"
                    label="User ID"
                    variant="outlined"
                />
                <Button disabled={isLoading} sx={{ mt: 2 }} variant="contained" onClick={() => onLogin(userID)}>
                    Login
                </Button>
                {error && (
                    <Typography id="modal-modal-error" variant="caption" component="p" style={{ color: "red" }}>
                        {/* @ts-ignore */}
                        {error?.message || "Unknown error, check console!"}
                    </Typography>
                )}
            </Box>
        </Modal>
    );
};

export default UserLoginModal;
