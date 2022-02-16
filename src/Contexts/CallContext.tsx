/* eslint-disable no-unused-vars */
import { CometChat } from "@cometchat-pro/chat";
import React from "react";

interface CallContextData {
    isCallInProgress: boolean;
    isCallConnected: boolean;
    incomingCall: CometChat.Call | null;
    callReceiver: null | CometChat.User;
    error: unknown;
    onStartCall: (receiver: CometChat.User) => void;
    onEndCall: () => void;
    onAcceptIncomingCall: () => void;
}

const initialState: CallContextData = {
    isCallInProgress: false,
    error: null,
    isCallConnected: false,
    callReceiver: null,
    onStartCall: () => {},
    onEndCall: () => {},
    incomingCall: null,
    onAcceptIncomingCall: () => {},
};

const CallContext = React.createContext(initialState);

export const useCallContext = () => React.useContext(CallContext);

export const CallContextProvider: React.FunctionComponent = ({ children }) => {
    const [state, setState] = React.useState<Omit<CallContextData, "onCallStart">>(initialState);

    const callSessionRef = React.useRef<CometChat.Call | null>(null);

    React.useEffect(() => {
        const listnerID = "Unique_Call_listener_id";
        CometChat.addCallListener(
            listnerID,
            new CometChat.CallListener({
                onIncomingCallReceived: (call: CometChat.Call) => {
                    console.log("Incoming call:", call);
                    callSessionRef.current = call;
                    setState((prevState) => ({
                        ...prevState,
                        callReceiver: call.getCallInitiator(),
                        isCallInProgress: true,
                        incomingCall: call,
                    }));
                },
                onOutgoingCallAccepted: (call: CometChat.Call) => {
                    console.log("Outgoing call accepted:", call);
                    setState((prevState) => ({
                        ...prevState,
                        isCallConnected: true,
                    }));
                    startCall(call);
                },
                onOutgoingCallRejected: (call: CometChat.Call) => {
                    console.log("Outgoing call rejected:", call);
                    onEndCall();
                },
                onIncomingCallCancelled: (call: CometChat.Call) => {
                    console.log("Incoming call calcelled:", call);
                    onEndCall();
                },
            }),
        );

        return () => {
            CometChat.removeCallListener(listnerID);
        };
    });

    const onStartCall = (receiver: CometChat.User) => {
        const callType = CometChat.CALL_TYPE.AUDIO;
        const receiverType = CometChat.RECEIVER_TYPE.USER;

        const call = new CometChat.Call(receiver.getUid(), callType, receiverType);

        CometChat.initiateCall(call).then(
            (outGoingCall) => {
                callSessionRef.current = outGoingCall;
                console.log("Call initiated successfully:", outGoingCall);
            },
            (error) => {
                console.log("Call initialization failed with exception:", error);
            },
        );

        setState((prevState) => ({
            ...prevState,
            isCallInProgress: true,
            callReceiver: receiver,
        }));
    };

    const onAcceptIncomingCall = () => {
        const sessionID = callSessionRef.current?.getSessionId();
        if (!sessionID)
            // Logical error
            throw new Error("Logical Error");

        CometChat.acceptCall(sessionID).then(
            (call) => {
                console.log("Call accepted successfully:", call);
                // Start Call --------------------------------------------
                startCall(call);
                // Start Call --------------------------------------------
            },
            (error) => {
                console.log("Call acceptance failed with error", error);
            },
        );
    };

    const startCall = (call: CometChat.Call) => {
        const sessionId = call.getSessionId();
        const callType = call.getType();
        const callSettings = new CometChat.CallSettingsBuilder()
            .setSessionID(sessionId)
            .enableDefaultLayout(true)
            .setIsAudioOnlyCall(callType === "audio")
            .build();

        CometChat.startCall(
            callSettings,
            document.getElementById("callScreen")!,
            new CometChat.OngoingCallListener({
                onUserJoined: (user: CometChat.User) => {
                    console.log("User joined call:", user);
                },
                onUserLeft: (user: CometChat.User) => {
                    console.log("User left call:", user);
                },
                onUserListUpdated: (userList: CometChat.User[]) => {
                    console.log("user list:", userList);
                },
                onCallEnded: (call: CometChat.Call) => {
                    console.log("Call ended:", call);
                    onEndCall();
                },
                onError: (error: any) => {
                    console.log("Error :", error);
                    onEndCall();
                },
                onMediaDeviceListUpdated: (deviceList: CometChat.MediaDevice) => {
                    console.log("Device List:", deviceList);
                },
                onUserMuted: (userMuted: CometChat.User, userMutedBy: CometChat.User) => {
                    // This event will work in JS SDK v3.0.2-beta1 & later.
                    console.log("Listener => onUserMuted:", userMuted, userMutedBy);
                },
                onScreenShareStarted: () => {
                    // This event will work in JS SDK v3.0.3 & later.
                    console.log("Screen sharing started.");
                },
                onScreenShareStopped: () => {
                    // This event will work in JS SDK v3.0.3 & later.
                    console.log("Screen sharing stopped.");
                },
            }),
        );

        setState((prevState) => ({
            ...prevState,
            isCallConnected: true,
        }));

        setTimeout(() => {
            const iframeDoc = document.getElementsByName("frame")[0];
            iframeDoc.classList.add("custom-call-screen");
        }, 200);
    };

    const onEndCall = () => {
        const status = state.incomingCall ? CometChat.CALL_STATUS.REJECTED : CometChat.CALL_STATUS.CANCELLED;
        const sessionId = callSessionRef.current?.getSessionId() || "unknown session";
        console.log(sessionId);
        CometChat.rejectCall(sessionId, status).then(
            (call) => {
                console.log("Call rejected successfully", call);
                const iframeDoc = document.getElementsByName("frame")[0];
                iframeDoc.classList.remove("custom-call-screen");
            },
            (error) => {
                console.log("Call rejection failed with error:", error);
            },
        );
        callSessionRef.current = null;
        setState((prevState) => ({
            ...prevState,
            isCallInProgress: false,
            isCallConnected: false,
            callReceiver: null,
            incomingCall: null,
        }));
    };

    return (
        <CallContext.Provider value={{ ...state, onStartCall, onEndCall, onAcceptIncomingCall }}>
            {children}
        </CallContext.Provider>
    );
};
