import { Box, Button, Modal, Typography } from "@mui/material";
import React from "react";
import { useCallContext } from "../../Contexts/CallContext";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
};

const CallScreen: React.FunctionComponent = ({ children }) => {
    const { isCallInProgress, onEndCall, callReceiver, incomingCall, onAcceptIncomingCall, isCallConnected } =
        useCallContext();

    return (
        <div>
            <Modal
                open={isCallInProgress}
                onClose={() => onEndCall()}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Call in Progress
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        {incomingCall && !isCallConnected && "Receiving a call from"}{" "}
                        {!incomingCall && !isCallConnected && "Calling"}
                        {isCallConnected && `in Call with `}
                        <Typography component="span" sx={{ fontWeight: 500 }}>
                            {callReceiver?.getName()}
                        </Typography>
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        {incomingCall && !isCallConnected && (
                            <Button
                                sx={{
                                    mr: 2,
                                }}
                                variant="contained"
                                onClick={() => onAcceptIncomingCall()}
                            >
                                Accept Call
                            </Button>
                        )}
                        <Button variant="contained" onClick={() => onEndCall()}>
                            Cancel Call
                        </Button>
                    </Box>
                </Box>
            </Modal>
            {children}
        </div>
    );
};

export default CallScreen;
