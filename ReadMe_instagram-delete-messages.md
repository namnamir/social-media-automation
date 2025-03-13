# 📌 Instagram Auto Message Deleter

## 🚀 Overview
This JavaScript script automates the process of deleting Instagram direct messages for free. It provides a user interface for controlling the deletion process, filtering users, and logging activities.

⚠ **Use this script responsibly.** Automating actions on Instagram may violate their terms of service, leading to account restrictions.

---

## **🚀 Features**
✅ Automatically deletes **all or specific** chats from Instagram  
✅ Provides a **floating control panel** for start, pause, and filtering  
✅ Allows **deleting chats by username**  
✅ Includes **statistics tracking** (deleted/skipped/errors)  
✅ **Avoids bot detection** by adding random delays  

---

## **📌 Prerequisites**
- **Google Chrome** (or another modern browser)  
- **Instagram Web** (https://www.instagram.com/)  
- **Basic JavaScript knowledge** (if modifications are needed)

---

## **⚠️ Disclaimer**
🚨 **Use this script responsibly!** Deleting chats is **irreversible**. Ensure you want to delete the messages before running the script.  

---

## 📜 How to Use

### **Step 1: Open Instagram Direct Messages**
1. **Go to** [Instagram Direct Messages](https://www.instagram.com/direct/inbox/).
2. **Ensure that you are logged in.**

### **Step 2: Open Developer Console**
1. Press `F12` or `Ctrl + Shift + I` (`Cmd + Option + I` on Mac) to open **Developer Tools**.
2. Navigate to the **Console** tab.
3. Copy the script and paste it into the console.
4. Press `Enter` to execute.

### **Step 3: Start the Script**
- A floating control panel will appear at the bottom right of the screen.
- Click **🚀 Start** to begin deleting messages.
- Use **⏸ Pause** to stop the process at any time.
- Use **🔍 Filtering** to specify which users’ messages should be deleted.

---

## ⚙ Configuration Options
Several settings can be adjusted within the script to control its behavior:

| **Variable**      | **Description** | **Default Value** |
|------------------|---------------|-----------------|
| `waitTime` | Delay time between actions to avoid bot detection | `2000` ms |
| `shortWaitUI` | Shorter delay for UI responsiveness | `500` ms |
| `logLevel` | Controls log visibility (0-3) | `0` |

---

## 🔍 SELECTORS Explained
The script interacts with Instagram's UI elements using **CSS selectors**. If the script stops working, **Instagram may have updated its HTML structure**, requiring an update to the `SELECTORS` object.

### **Where to Update?**
Inside the script, you will find this section:

```js
const SELECTORS = {
    chatList: 'div[role="button"].x1i10hfl.x1qjc9v5.xjqpnuy',
    activeChatUsername1: 'a.x1i10hfl.xjbqb8w.x1ejq31n',
    activeChatUsername2: 'div.x9f619.xjbqb8w.x78zum5',
    menuContainer: 'div[role="button"]',
    menuButton: 'conversation information',
    deleteContainer: 'span',
    deleteButton: 'delete chat',
    deleteConfirmContainer: 'button',
    deleteConfirmButton: 'delete',
};

```

### **How to Update SELECTORS?**
1. **Inspect the Instagram elements manually:**
   - Right-click on the chat list or delete button → **Inspect Element**.
   - Find the correct `class` or `role` attributes.
2. **Replace outdated selectors** in the `SELECTORS` object.
3. **Re-run the script.**

---

## 🌎 Translations
All log messages are stored in the `MESSAGES` object, making them easy to translate.

Example:
```js
const MESSAGES = {
    scriptStarted:           ["🚀 Script started!", 1],
    noChatsFound:            ["⚠️ No chats found! Stopping.", 0],
    chatDeleted:             ["✅ Chat deleted!", 0],
};
```
**To translate:** Change the messages inside the square brackets.

Example (French Translation):
```js
const MESSAGES = {
    scriptStarted:           ["🚀 Script démarré!", 1],
    noChatsFound:            ["⚠️ Aucun chat trouvé! Arrêt.", 0],
    chatDeleted:             ["✅ Chat supprimé!", 0],
};
```

---

## 📊 Log Levels
To control how much information is logged, update `logLevel`.

| **Log Level** | **Description** |
|-------------|----------------|
| `0` | Info (General messages) |
| `1` | Success (Only key success messages) |
| `2` | Warning (Potential issues) |
| `3` | Error (Critical failures) |

Example usage:
```js
if (logLevel >= message[1]) {
    console.log(message[0]);
}
```

---

## **📢 Issues & Improvements**
For any issues or improvements, feel free to **fork and modify** the script. Let me know if you need additional features! 🚀 

---

## 🔥 Final Notes
- **This script is provided "as-is"** with no guarantees.
- **Use at your own risk**—Instagram may detect automation if used excessively.
- **Always test with a secondary account** before running it on your main profile.

🎉 **Happy Cleaning!**
