(async function deleteMessages() {
    // ===== CONFIGURATION VARIABLES =====
    const waitTime = 2000; // Delay time to avoid bot detection
    const shortWaitUI = 500; // Shorter delay (ms) for UI responsiveness
    const logLevel = 0; // Log level: 0=info, 1=success, 2=warning, 3=error

    // ========== SELECTORS ==============
    // Selectors for various UI elements
    const SELECTORS = {
        chatList: 'div[role="button"].x1i10hfl.x1qjc9v5.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20',
        activeChatUsername1: 'a.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk',
        activeChatUsername2: 'div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.xl56j7k.xz9dl7a',
        menuContainer: 'div[role="button"]',
        menuButton: 'conversation information',
        deleteContainer: 'span',
        deleteButton: 'delete chat',
        deleteConfirmContainer: 'button',
        deleteConfirmButton: 'delete',
    };

    // =========== MESSAGES ===============
    // Messages for logging (modifiable for translation)
    // Style: [message, logLevel] - logLevel: 0=info, 1=success, 2=warning, 3=error
    const MESSAGES = {
        scriptStarted:           ["🚀 Script started!", 1],
        noChatsFound:            ["⚠️ No chats found! Stopping.", 0],
        activatingChat:          ["🔄 Clicking on chat, waiting for activation...", 0],
        chatActivationFailed:    ["⚠️ Chat activation failed! Skipping to the next chat.", 0],
        chatMenuOpened:          ["📂 Chat menu is opened.", 0],
        deleteButtonNotFound:    [`⚠️ '${SELECTORS.deleteButton}' button not found! Please inspect the options menu manually or change it in the SELECTORS`, 0],
        deletionButtonClicked:   ["🗑️ Delete chat button is clicked.", 0],
        waitingConfirmButton:    ["⌛ Waiting for Delete confirmation button...", 0],
        confirmButtonNotFound:   [`⚠️ '${SELECTORS.deleteConfirmButton}' (confirmation) button not found! Please inspect the options menu manually or change it in the SELECTORS`, 0],
        chatDeleted:             ["🎉 Chat deleted!", 0], 
        allChatsDeleting:        ["🗑️ Deleting all chats (No filtering enabled).", 0],
        allChatsDeleted:         ["🎉 All chats deleted!", 0],
        clickableParentNotFound: ["⚠️ Clickable parent button not found!", 0],
        menuNotFound:            [`⚠️ '${SELECTORS.menuButton}' button not found! Please inspect the options menu manually or change it in the SELECTORS.`, 0],
        warning:                 ["⚠️ Are you sure you want to delete all chats? This action is irreversible!", 0],
        username:                ["👤 User is selected: __USERNAME__", 0],
        usernameNotFound:        ["⚠️ Could not retrieve username! Skipping chat.", 0],
        usernameNotMatched:      ["🔄 Skipping chat with 👤 __USERNAME__, not in target user list.", 0], // Do not change or remove '__USERNAME__'
        usernameAlreadyDeleted:  ["⚠️ Skipping the user 👤 __USERNAME__, their chats are already deleted.", 0], // Do not change or remove '__USERNAME__'
        usernameDeletion:        ["🗑️ Deleting chat with username", 0],
        allUsersDeleted:         ["✅ All target users' chats have been deleted. Stopping script.", 0],
        targetUserList:          ["🆕 Updated target user list", 0],
        retry:                   ["Retry", 0],
        total:                   ["Total", 0],
        skipped:                 ["Skipped", 0],
        totalDeleted:            ["Total Deleted:", 0],
        pauseButton:             ["⏸ Pause", 0],
        startButton:             ["▶️ Start", 0],
        filterButton:            ["🔍 Filter", 0],
    };

    // Variables
    let deletedCount = 0; // Counter for deleted messages
    let isPaused = true; // State variable to control execution
    let filterEnabled = false;  // Default: delete all chats
    let toDeleteUsers = new Set(); // Initially empty, users can add names dynamically
    let deletedUsersInitial = new Set(); // Store deleted users to avoid duplicates
    let deletedUsers = new Set(); // Store deleted users and update it after each deletion
    let countMessagesDeleted = 0; // Counter for deleted messages
    let countMessagesSkipped = 0; // Counter for skipped messages
    let countMessagesTotal = 0; // Counter for total messages
    let countError = 0; // Counter for errors
    let countToDeleteUsers = 0; // Counter for users to delete
    let countDeletedUsers = 0; // Counter for users that are deleted

    // Create floating UI panel
    const controlPanel = document.createElement("div");
    controlPanel.id = "deleteMessagesUI";
    controlPanel.innerHTML = `
        <style>
            #deleteMessagesUI {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.6);
                color: white;
                padding: 15px;
                border-radius: 12px;
                z-index: 9999;
                font-family: "Arial", sans-serif;
                width: 350px;
                box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(10px);
                transition: all 0.3s ease-in-out;
            }
            #deleteMessagesUI button {
                width: auto;
                padding: 10px 15px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                transition: 0.2s;
                margin: 5px;
                opacity: 0.8;
            }
            #deleteMessagesUI button.active {
                width: 100%;
                opacity: 1;
            }
            #buttonRow {
                display: flex;
                justify-content: space-between;
                gap: 5px;
            }
            #startBtn { background: #28a745; color: white; }
            #pauseBtn { background: #ff9800; color: white; }
            #filterBtn { background: #007bff; color: white; }
            #userInputContainer {
                display: flex;
                align-items: center;
                margin-top: 10px;
                display: none;
            }
            #userInput {
                flex-grow: 1;
                padding: 8px;
                border-radius: 5px;
                border: none;
                color: rgba(0, 0, 0, 0.8);
            }
            #addUserBtn {
                background: rgba(255, 255, 255, 0.8);
                color: white;
                padding: 8px 12px;
                margin-left: 10px;
            }
            .toDeleteUsersList span {
                margin-left: 5px;
                cursor: pointer;
                color: red;
            }
            #toDeleteUsersList.deleted {
                color: gray;
                text-decoration: line-through;
            }
            #toDeleteUsersList.toDelete {
                color: inherit;
                text-decoration: inherit;
            }
            #toDeleteUsersList {
                display: block;
                max-height: 120px;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 5px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 5px;
            }
            #logBox {
                max-height: 150px;
                overflow-y: auto;
                background: rgba(0, 0, 0, 0.5);
                padding: 10px;
                margin-top: 10px;
                font-size: 80%;
                font-family: 'Courier New', monospace;
                border-radius: 8px;
                color: #ddd;
                border-left: 4px solid #007bff;
            }
            #statsBar {
                background: rgba(255, 255, 255, 0.1);
                padding: 8px;
                border-radius: 8px;
                font-size: 120%;
                text-align: center;
                margin-bottom: 10px;
                color: #fff;
            }
        </style>
        <div>
            <div id="buttonRow">
                <button id="startBtn" class="active">🚀 Start</button>
                <button id="pauseBtn" class="active">⏸ Pause</button>
                <button id="filterBtn" class="active">🔍 Filtering</button>
            </div>
            <div id="statsBar">✏️ <span id="deletedCount">0</span> 🦘 <span id="skippedCount">0</span> 📃 <span id="totalCount">0</span> 👥 <span id="toDeleteUsersCount">0</span> (<span id="deletedUserCount">0</span>) 📛 <span id="errorCount">0</span></div>
            <div id="userInputContainer">
                <input type="text" id="userInput" placeholder="Enter usernames...">
                <button id="addUserBtn">➕</button>
            </div>
            <div id="toDeleteUsersList"></div>
            <div id="logBox">📜 Logs will appear here...</div>
        </div>
    `;

    document.body.appendChild(controlPanel);

    document.getElementById("startBtn").onclick = () => {
        isPaused = false;
        logMessage(MESSAGES.startButton);
        deleteChat();
    };

    document.getElementById("pauseBtn").onclick = () => {
        isPaused = true;
        logMessage(MESSAGES.pauseButton);
    };

    document.getElementById("filterBtn").onclick = () => {
        filterEnabled = !filterEnabled;
    
        document.getElementById("filterBtn").innerText = filterEnabled ? "🔴 Disable Filter" : "🔍 Enable Filter";
        document.getElementById("userInputContainer").style.display = filterEnabled ? "flex" : "none";
        document.getElementById("toDeleteUsersList").style.display = filterEnabled ? "inherit" : "none";
    
        if (filterEnabled) {
            updateToDeleteUsers();
        }
    };
    

    // Function to add user to the target list
    function addUser() {
        const userInput = document.getElementById("userInput");
        const usersArray = userInput.value.trim().toLowerCase().split(/[,;\n\s\t]+/).map(user => user.trim()).filter(user => user);
        userInput.value = "";
        userInput.focus();

        if (usersArray.length) {
            usersArray.forEach(user => toDeleteUsers.add(user));
            updateToDeleteUsers();
        }
    }
    
    // Add user to the target list on button click or Enter key
    document.getElementById("addUserBtn").onclick = addUser;
    document.getElementById("userInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") addUser();
    });

    // Function to update stats on the UI
    function updateStats() {
        document.getElementById("deletedCount").innerText = countMessagesDeleted;
        document.getElementById("skippedCount").innerText = countMessagesSkipped;
        document.getElementById("totalCount").innerText = countMessagesDeleted + countMessagesSkipped; // Fix total count
        document.getElementById("errorCount").innerText = countError;
        document.getElementById("toDeleteUsersCount").innerText = countToDeleteUsers;
        document.getElementById("deletedUserCount").innerText = deletedUsers.size; // Show deleted users correctly
    }

    // Function to update target users list on the UI
    function updateToDeleteUsers() {
        const toDeleteUsersList = document.getElementById("toDeleteUsersList");
        toDeleteUsersList.innerHTML = "";

        if (!toDeleteUsers || toDeleteUsers.size === 0) {
            logMessage("⚠️ No users in filter list.");
            return;
        }

        toDeleteUsers.forEach(user => {
            const userTag = document.createElement("span");
            userTag.classList.add(deletedUsersInitial.has(user) ? "deleted" : "toDelete");
            userTag.innerHTML = ` ${user} ❌ `;
            userTag.onclick = () => removeUser(user);
            toDeleteUsersList.appendChild(userTag);
        });
        
        countToDeleteUsers = toDeleteUsers.size;
        updateStats();
    }

    // Function to track deleted users
    function markUserAsDeleted(user) {
        // Add user to the deleted users list
        if (!deletedUsers.has(user)) {
            deletedUsers.add(user);
            deletedUsersInitial.add(user);
            countDeletedUsers += 1;
        }
    }

    // Remove user from the target list if clicked on the "❌" button
    window.removeUser = (user) => {
        toDeleteUsers.delete(user);
        deletedUsers.delete(user);
        updateToDeleteUsers();
    };

    // Function to log messages to the UI and console
    function logMessage(message) {
        // Check if message is an array and has a log level
        if (logLevel >= message[1]) {
            const logBox = document.getElementById("logBox");
            const logEntry = document.createElement("div");
            logEntry.innerText = `[${new Date().toLocaleTimeString()}] ${message[0]}`;
            logBox.appendChild(logEntry);
            logBox.scrollTop = logBox.scrollHeight;
            console.log(logEntry.innerText);
        }
    }

    // Function to introduce a delay
    function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    // Get the username of the active chat 
    function getActiveChatUsername() {
        // Try the first selector (Profile Link)
        let userElement = document.querySelector(SELECTORS.activeChatUsername1);
        // Extract username from the `href` attribute
        if (userElement) {
            let hrefValue = userElement.getAttribute("href")?.trim();
    
            // If `href` is valid AND NOT `/`, return extracted username
            if (hrefValue && hrefValue !== "/") {
                return hrefValue.replace(/\//g, "").toLowerCase();
            }
        }
    
        // If first selector fails OR `href="/"`, try the second selector
        userElement = document.querySelector(SELECTORS.activeChatUsername2);
        // Remove extra text after '·' separator
        if (userElement) {
            const extractedText = userElement.innerText.split("·")[0].trim();
            return extractedText.toLowerCase();
        }
    
        // Return null if both selectors fail
        return null;
    }

    // Main function to delete chats
    async function deleteChat() {
        let index = 0;
        let chatList = await Array.from(document.querySelectorAll(SELECTORS.chatList));

        // Check if there are chats to delete and script is not paused
        if (isPaused) {
            logMessage(MESSAGES.pauseButton);
            return;
        } else if (chatList.length === 0) {
            logMessage(MESSAGES.noChatsFound);
            return;
        }

        countMessagesTotal += 1;
        updateStats();

        logMessage(MESSAGES.scriptStarted);

        // Loop through chat list
        while (index < chatList.length && !isPaused) {
            // Update stats and check if script is paused
            updateStats();

            // Get the first chat and move to the next chat if activation fails
            let chat = chatList[index];
            if (!chat) {
                logMessage(MESSAGES.noChatsFound);
                return;
            }
            
            // Scroll chat into view
            chat.scrollIntoView({ behavior: "smooth", block: "center" });
            await delay(shortWaitUI);

            // Click chat to activate
            chat.click();

            logMessage(MESSAGES.activatingChat);

            await delay(waitTime); // Allow UI update

            // Extract username and skip if username is not found
            let username = getActiveChatUsername();

            // If username is not found, skip the chat
            if (!username) {
                logMessage(MESSAGES.usernameNotFound);
            // Skip if user is already deleted
            } else if (deletedUsers.has(username)) {
                MESSAGES.usernameAlreadyDeleted[0] = MESSAGES.usernameAlreadyDeleted[0].replace("__USERNAME__", username);
                logMessage(MESSAGES.usernameAlreadyDeleted);
                index += 1;
                continue;
            }

            MESSAGES.username[0] = MESSAGES.username[0].replace("__USERNAME__", username);
            logMessage(MESSAGES.username);

            // Check if username is in the target list; if not skip
            if (filterEnabled && !toDeleteUsers.has(username.toLowerCase())) {
                MESSAGES.usernameNotMatched[0] = MESSAGES.usernameNotMatched[0].replace("__USERNAME__", username)
                logMessage(MESSAGES.usernameNotMatched);
                index += 1;
                countMessagesSkipped += 1;
                continue;
            } else if (!filterEnabled) {
                logMessage(MESSAGES.allChatsDeleting);
            }

            // Open chat menu
            // Wait for "Conversation information" button
            const menuButton = [...document.querySelectorAll(SELECTORS.menuContainer)]
                .find(el => el.textContent.trim().toLowerCase().includes(SELECTORS.menuButton.toLowerCase()));

            // Click on the "menu" button
            if (menuButton) {
                menuButton.click();
                logMessage(MESSAGES.chatMenuOpened);
                await delay(shortWaitUI);

                // Wait for "Delete chat" button
                const deleteButton = [...document.querySelectorAll(SELECTORS.deleteContainer)]
                    .find(el => el.textContent.trim().toLowerCase().includes(SELECTORS.deleteButton.toLowerCase()));

                // Click on the "delete" button
                if (deleteButton) {
                    deleteButton.click();
                    logMessage(MESSAGES.deletionButtonClicked);
                    await delay(shortWaitUI);

                    // Wait for final "delete" (confirmation) button
                    const deleteConfirmButton = [...document.querySelectorAll(SELECTORS.deleteConfirmContainer)]
                        .find(el => el.textContent.trim().toLowerCase().includes(SELECTORS.deleteConfirmButton.toLowerCase()));
                    
                    // Click on the "delete" (confirmation) button
                    if (deleteConfirmButton) {
                        deleteConfirmButton.click();
                        MESSAGES.chatDeleted[0] = MESSAGES.chatDeleted[0].replace("__USERNAME__", username);
                        logMessage(MESSAGES.chatDeleted);
                        await delay(shortWaitUI);

                        // Update stats and mark user as deleted
                        markUserAsDeleted(username);
                        countMessagesDeleted += 1;

                        // Remove user from target list
                        if (username) {
                            toDeleteUsers.delete(username.toLowerCase());
                            updateToDeleteUsers();
                        }

                        // Check if all target users are deleted, stopping the script
                        if (filterEnabled && toDeleteUsers.size === 0) {
                            logMessage(MESSAGES.allUsersDeleted);
                            return;
                        }
                    } else {
                        logMessage(MESSAGES.confirmButtonNotFound);
                        countError += 1;
                    }
                } else {
                    logMessage(MESSAGES.deleteButtonNotFound);
                    countError += 1;
                }
            } else {
                logMessage(MESSAGES.menuNotFound);
                countError += 1;
            }

            // Refresh chat list and move to the next chat
            chatList = await Array.from(document.querySelectorAll(SELECTORS.chatList));
        }

        logMessage(MESSAGES.allChatsDeleted);
        logMessage(`📊 Statistics 📊`);
        logMessage(`🗑️ Deleted Messages: ${countMessagesDeleted}`);
        logMessage(`⏭️ Skipped Messages: ${countMessagesSkipped}`);
        logMessage(`📃 Total Processed:  ${countMessagesDeleted + countMessagesSkipped}`);
        logMessage(`⚠️ Errors:           ${countError}`);
    }

    deleteChat();
})();
