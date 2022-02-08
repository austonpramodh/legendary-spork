import { CometChat } from "@cometchat-pro/chat";

const appID = "202757e7aec22b43";
const region = "us";
export const authKey = "431552d9f78fa9ec94095b5dc69eee157d0e986f";
const appSetting = new CometChat.AppSettingsBuilder()
    .subscribePresenceForAllUsers()
    .setRegion(region)
    .autoEstablishSocketConnection(true)
    .build();

export const initCometChat = () =>
    CometChat.init(appID, appSetting).then(
        () => {
            console.log("Initialization completed successfully");
        },
        (error) => {
            console.log("Initialization failed with error:", error);
        },
    );

// Export class MyCometChat {
//     constructor() {
//         console.log("Hi there");
//     }
// }
export const MyCometChat = CometChat;
