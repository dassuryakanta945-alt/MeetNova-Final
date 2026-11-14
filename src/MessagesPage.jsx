import { useState, useEffect, useRef } from "react";
import "./MessagesPage.css";

import { auth, db } from "./firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  runTransaction,
  orderBy,
  updateDoc,
} from "firebase/firestore";

const chatMessages = {
  1: [
    { id: 1, sender: "received", text: "Hey! How is the project going?", time: "10:35 AM" },
    { id: 2, sender: "sent", text: "It's going well! I'm working on the new messaging system.", time: "10:38 AM" },
    { id: 3, sender: "received", text: "Great! Are we meeting today?", time: "10:42 AM" },
  ],
  2: [
    { id: 1, sender: "received", text: "Thanks for sharing the files!", time: "09:30 AM" },
  ],
  3: [
    { id: 1, sender: "received", text: "Let's discuss the project.", time: "Yesterday" },
  ],
  4: [
    { id: 1, sender: "received", text: "Sounds good 👍", time: "Yesterday" },
  ],
};

const conversations = [
  {
    id: 1,
    name: "Alex Morgan",
    email: "alex@example.com",
    message: "Hey! Are we meeting today?",
    time: "10:42 AM",
    avatar: "AM",
    online: true,
    unread: 2,
    active: true,
  },
  {
    id: 2,
    name: "Sophia Williams",
    email: "sophia@example.com",
    message: "Thanks for sharing the files!",
    time: "09:30 AM",
    avatar: "SW",
    online: true,
    unread: 0,
    active: false,
  },
  {
    id: 3,
    name: "Daniel Smith",
    email: "daniel@example.com",
    message: "Let's discuss the project.",
    time: "Yesterday",
    avatar: "DS",
    online: false,
    unread: 0,
    active: false,
  },
  {
    id: 4,
    name: "Emma Johnson",
    email: "emma@example.com",
    message: "Sounds good 👍",
    time: "Yesterday",
    avatar: "EJ",
    online: false,
    unread: 0,
    active: false,
  },
];

function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState(conversations[0]);
  const [messageInput, setMessageInput] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const emojiOptions = [
  // Smileys & Emotions
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "🥹",
  "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘",
  "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐",
  "🤓", "😎", "🥸", "🤩", "🥳", "🙂‍↕️", "😏", "😒", "😞", "😔",
  "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢",
  "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱",
  "😨", "😰", "😥", "😓", "🫣", "🤗", "🫡", "🤔", "🫢", "🤭",
  "🤫", "🤥", "😶", "🫥", "😐", "😑", "😬", "🙄", "😯", "😦",
  "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢",
  "🤮", "🤧", "😷", "🤒", "🤕", "💀", "☠️", "👻", "👽", "🤖",

  // Hearts & Love
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎",
  "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝",
  "💟", "♥️", "💋", "💌", "😍", "🥰", "😘",

  // Hands & Gestures
  "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️",
  "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇",
  "☝️", "🫵", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏",
  "🙌", "🫶", "👐", "🤲", "🙏", "✍️", "💅", "💪",

  // People & Activities
  "👶", "🧒", "👦", "👧", "🧑", "👨", "👩", "🧔", "👴",
  "👵", "🙍", "🙎", "🙅", "🙆", "💁", "🙋", "🧏", "🙇",
  "🤦", "🤷", "👮", "🕵️", "💂", "🥷", "👷", "🤴", "👸",
  "👳", "👲", "🧕", "👼", "🎅", "🤶", "🦸", "🦹",
  "🧙", "🧚", "🧛", "🧜", "🧝", "🧞", "🧟",

  // Animals & Nature
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️",
  "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉",
  "🙊", "🐔", "🐧", "🐦", "🦆", "🦅", "🦉", "🦇", "🐺",
  "🐗", "🐴", "🦄", "🐝", "🦋", "🐌", "🐞", "🐢", "🐍",
  "🦎", "🐙", "🦑", "🦀", "🐠", "🐟", "🐬", "🐳", "🦈",
  "🐊", "🐘", "🦒", "🦓", "🦍", "🐪", "🐫", "🦘", "🐄",
  "🐎", "🐖", "🐑", "🐐", "🦌", "🐕", "🐈", "🐓", "🦜",
  "🌵", "🌲", "🌳", "🌴", "🌱", "🌿", "☘️", "🍀", "🌷",
  "🌹", "🌺", "🌻", "🌼", "🌸", "💐", "🍁", "🍂", "🍃",
  "🌍", "🌎", "🌏", "🌙", "⭐", "🌟", "✨", "⚡", "🔥",
  "🌈", "☀️", "🌤️", "⛅", "🌧️", "⛈️", "❄️", "☃️", "🌊",

  // Food & Drinks
  "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓",
  "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅",
  "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🌽", "🥕", "🧄",
  "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🧀", "🥚",
  "🍳", "🥞", "🧇", "🥓", "🍔", "🍟", "🍕", "🌭", "🥪",
  "🌮", "🌯", "🥙", "🧆", "🥗", "🍝", "🍜", "🍲", "🍛",
  "🍣", "🍱", "🥟", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠",
  "🍢", "🍡", "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂",
  "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "☕", "🍵",
  "🧃", "🥤", "🧋", "🍺", "🍻", "🍷", "🥂", "🍾", "🥛",

  // Travel & Places
  "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒",
  "🚐", "🚚", "🚛", "🚜", "🛵", "🏍️", "🚲", "🛴", "🚂",
  "🚆", "🚇", "✈️", "🛫", "🛬", "🚀", "🛸", "🚁", "⛵",
  "🚢", "⚓", "🏖️", "🏝️", "🏕️", "🏠", "🏡", "🏢", "🏙️",
  "🌆", "🌃", "🌉", "🏰", "🗼", "🗽", "⛩️", "🕌", "🛕",

  // Activities & Sports
  "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏",
  "🎱", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🥊", "🥋",
  "⛳", "🏹", "🎣", "🤿", "🥇", "🥈", "🥉", "🏆", "🏅",
  "🎖️", "🎮", "🕹️", "🎯", "🎲", "🧩", "🎭", "🎨", "🎬",
  "🎤", "🎧", "🎼", "🎹", "🥁", "🎸", "🎺", "🎻", "🎷",

  // Objects
  "📱", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "💾", "💿", "📷",
  "📸", "📹", "🎥", "📞", "☎️", "📺", "📻", "🔋", "🔌",
  "💡", "🔦", "🕯️", "🧯", "💰", "💵", "💴", "💳", "💎",
  "🔑", "🗝️", "🔒", "🔓", "🔨", "⚒️", "🛠️", "🧰", "🧲",
  "📚", "📖", "📝", "✏️", "🖊️", "📌", "📎", "✂️", "📁",
  "📂", "📅", "📆", "📈", "📉", "📊", "📧", "📩", "📦",
  "🎁", "🎈", "🎉", "🎊", "🏆", "🔔", "🔕", "⏰", "⌛",

  // Symbols
  "❤️", "💯", "💢", "💥", "💫", "💦", "💨", "🕳️", "💬",
  "🗨️", "🗯️", "💭", "🛑", "⚠️", "🚫", "♻️", "✅", "☑️",
  "✔️", "❌", "❎", "➕", "➖", "✖️", "➗", "⭐", "🌟",
  "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤",

  // Flags
  "🏳️", "🏴", "🏁", "🚩", "🏳️‍🌈", "🏳️‍⚧️",
  "🇮🇳", "🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇯🇵", "🇰🇷",
  "🇫🇷", "🇩🇪", "🇮🇹", "🇧🇷", "🇷🇺", "🇨🇳", "🇵🇰"
];
  const [replyingTo, setReplyingTo] = useState(null);
  const [messagesByConversation, setMessagesByConversation] = useState(chatMessages);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [conversationPreviews, setConversationPreviews] = useState({});
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [openMessageMenuId, setOpenMessageMenuId] = useState(null);
  const [deleteConfirmMessage, setDeleteConfirmMessage] = useState(null);

  const chatBodyRef = useRef(null);
  const sendingRef = useRef(false);

  useEffect(() => {
  const chatBody = chatBodyRef.current;

  if (chatBody) {
    chatBody.scrollTop = chatBody.scrollHeight;
  }
}, [messagesByConversation, activeConversation]);

useEffect(() => {
  const usersRef = collection(db, "publicProfiles");

  const unsubscribe = onSnapshot(
    usersRef,
    (snapshot) => {
      const users = snapshot.docs
        .map((userDoc) => ({
          id: userDoc.id,
          ...userDoc.data(),
        }))
        .filter((user) => user.id !== auth.currentUser?.uid)
        .map((user) => ({
          id: user.id,
          name: user.name || "MeetNova User",
          avatar: (user.name || "MU")
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          email: "",
          message: "No messages yet",
          time: "",
          online: false,
          unread: 0,
        }));

      setAvailableUsers(users);
    },
    (error) => {
      console.error("User directory error:", error);
    }
  );

    return () => unsubscribe();
}, []);

useEffect(() => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const conversationsQuery = query(
    collection(db, "conversations"),
    where("participantIds", "array-contains", currentUser.uid)
  );

  const unsubscribe = onSnapshot(
    conversationsQuery,
    (snapshot) => {
      const previews = {};

      snapshot.forEach((conversationDoc) => {
        const data = conversationDoc.data();
        const otherUserId = data.participantIds?.find(
          (id) => id !== currentUser.uid
        );

        if (!otherUserId) return;

        const lastMessage = data.lastMessage || "";
        const senderId = data.lastMessageSenderId;

        previews[otherUserId] = {
          message: lastMessage
            ? `${senderId === currentUser.uid ? "You: " : ""}${lastMessage}`
            : "No messages yet",
          time: data.lastMessageAt?.toDate
            ? data.lastMessageAt.toDate().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
        };
      });

      setConversationPreviews(previews);
    },
    (error) => {
      console.error("Conversation preview error:", error);
    }
  );

  return () => unsubscribe();
}, []);

// Automatically select the first real user
useEffect(() => {
  if (availableUsers.length === 0) return;

  setActiveConversation((current) => {
    const existingUser = availableUsers.find(
      (user) => user.id === current?.id
    );

    return existingUser || availableUsers[0];
  });
}, [availableUsers]);

useEffect(() => {
  const currentUser = auth.currentUser;
const otherUserId = activeConversation?.id;

if (
  !currentUser ||
  typeof otherUserId !== "string" ||
  !availableUsers.some((user) => user.id === otherUserId)
) {
  return;
}

const conversationId = [
  currentUser.uid,
  otherUserId,
].sort().join("_");

  const messagesRef = collection(
    db,
    "conversations",
    conversationId,
    "messages"
  );

  const messagesQuery = query(
    messagesRef,
    orderBy("createdAt", "asc")
  );

  const unsubscribe = onSnapshot(
    messagesQuery,
    (snapshot) => {

      const loadedMessages = snapshot.docs
  .map((messageDoc) => {
    const data = messageDoc.data();
    const isOwnMessage = data.senderId === currentUser.uid;

    const status = !isOwnMessage
      ? undefined
      : data.readAt
        ? "seen"
        : data.deliveredAt
          ? "delivered"
          : "sent";

    return {
      id: messageDoc.id,
      sender: isOwnMessage ? "sent" : "received",
      text: data.text,
      senderId: data.senderId,
      replyToMessageId: data.replyToMessageId || null,
      replyToText: data.replyToText || null,
      replyToSenderId: data.replyToSenderId || null,
      hiddenFor: data.hiddenFor || [],
      deletedForEveryone: data.deletedForEveryone === true,
      time: data.createdAt?.toDate
        ? data.createdAt.toDate().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Sending...",
      status,
    };
  })
  .filter(
    (message) => !message.hiddenFor.includes(currentUser.uid)
  );

snapshot.docs.forEach((messageDoc) => {
  const data = messageDoc.data();

  // Sirf received messages ke receipts update honge
  if (data.senderId !== currentUser.uid) {
    const messageRef = doc(
      db,
      "conversations",
      conversationId,
      "messages",
      messageDoc.id
    );

    // Pehle delivered mark karo
    
  }
});
 
      setMessagesByConversation((previous) => ({
        ...previous,
        [activeConversation.id]: loadedMessages,
      }));
    },
    (error) => {
      console.error("Messages loading error:", error);
    }
  );

  return () => unsubscribe();
}, [activeConversation?.id, activeConversation?.conversationId, availableUsers]);

const handleSelectUser = async (user) => {
  const currentUser = auth.currentUser;

  if (!currentUser || !user?.id || currentUser.uid === user.id) {
    return;
  }

  const participantIds = [currentUser.uid, user.id].sort();
  const conversationId = participantIds.join("_");

  const conversationRef = doc(db, "conversations", conversationId);

  try {
    await runTransaction(db, async (transaction) => {
      const conversationSnap = await transaction.get(conversationRef);

      if (!conversationSnap.exists()) {
        transaction.set(conversationRef, {
          participantIds,
          createdBy: currentUser.uid,
          createdAt: serverTimestamp(),
          lastMessage: "",
          lastMessageAt: serverTimestamp(),
        });
      }
    });

    setActiveConversation({
      ...user,
      conversationId,
    });

    setIsNewChatOpen(false);
    setUserSearch("");
  } catch (error) {
    console.error("Conversation creation error:", error);
    window.alert("Unable to open this conversation. Please try again.");
  }
};

const handleSendMessage = async () => {
  const text = messageInput.trim();
  const currentUser = auth.currentUser;
  const receiverId = activeConversation?.id;

  if (!text || !currentUser || !receiverId) return;
  if (currentUser.uid === receiverId) return;
  if (sendingRef.current) return;

  sendingRef.current = true;

  // Clear input immediately after sending starts
  setMessageInput("");

  const participantIds = [currentUser.uid, receiverId].sort();
  const conversationId = participantIds.join("_");
  const conversationRef = doc(db, "conversations", conversationId);

  try {
    await runTransaction(db, async (transaction) => {
      const conversationSnap = await transaction.get(conversationRef);

      if (!conversationSnap.exists()) {
        transaction.set(conversationRef, {
          participantIds,
          createdBy: currentUser.uid,
          createdAt: serverTimestamp(),
          lastMessage: "",
          lastMessageAt: serverTimestamp(),
        });
      }
    });

    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages"
    );


    await addDoc(messagesRef, {
      senderId: currentUser.uid,
      text,
      createdAt: serverTimestamp(),
      deliveredAt: null,
      readAt: null,
      replyToMessageId: replyingTo?.id || null,
      replyToText: replyingTo?.text || null,
      replyToSenderId: replyingTo?.senderId || null,
    });


    await updateDoc(conversationRef, {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      lastMessageSenderId: currentUser.uid,
    });

    setActiveConversation((current) => ({
      ...current,
      conversationId,
    }));

    setReplyingTo(null);

  } catch (error) {
    console.error("Message sending error:", error);

    // Restore text only if the input is still empty
    setMessageInput((current) => current || text);

    window.alert("Message could not be sent. Please try again.");
  } finally {
    sendingRef.current = false;
  }
};

const handleDeleteForMe = async (message) => {
  const currentUser = auth.currentUser;
  if (!currentUser || !activeConversation?.id) return;

  const conversationId = [
    currentUser.uid,
    activeConversation.id,
  ].sort().join("_");

  try {
    const messageRef = doc(
      db,
      "conversations",
      conversationId,
      "messages",
      message.id
    );

    await updateDoc(messageRef, {
      hiddenFor: [...new Set([
        ...(message.hiddenFor || []),
        currentUser.uid,
      ])],
    });
  } catch (error) {
    console.error("Delete for me error:", error);
    window.alert("Unable to delete this message.");
  }
};

const handleDeleteForEveryone = async (message) => {
  const currentUser = auth.currentUser;

  if (!currentUser || message.senderId !== currentUser.uid) return;

  const conversationId = [
    currentUser.uid,
    activeConversation.id,
  ].sort().join("_");

  try {
    const messageRef = doc(
      db,
      "conversations",
      conversationId,
      "messages",
      message.id
    );

    await updateDoc(messageRef, {
      deletedForEveryone: true,
      deletedAt: serverTimestamp(),
      deletedBy: currentUser.uid,
    });
  } catch (error) {
    console.error("Delete for everyone error:", error);
    window.alert("Unable to delete this message.");
  }
};

  return (
    <div className="messages-page">

      {/* Page Header */}
      <div className="messages-header">
        <div>
          <h1>Messages</h1>
          <p>Stay connected. Collaborate. Get things done.</p>
        </div>

        <button
         className="new-chat-btn"
         type="button"
         onClick={() => {
           setIsNewChatOpen(true);
           setUserSearch("");
         }}
       >
         <span>＋</span>
         New Chat
       </button>
      </div>

{/* New Chat Panel */}
{isNewChatOpen && (
  <div className="new-chat-overlay">
    <div className="new-chat-panel">
      <div className="new-chat-heading">
        <h2>Start a New Chat</h2>

        <button
          type="button"
          onClick={() => setIsNewChatOpen(false)}
          aria-label="Close new chat"
        >
          ✕
        </button>
      </div>

      <input
        type="text"
        placeholder="Search people..."
        value={userSearch}
        onChange={(e) => setUserSearch(e.target.value)}
      />

      <div className="new-chat-user-list">
        {availableUsers
          .filter((user) =>
            user.name.toLowerCase().includes(userSearch.toLowerCase())
          )
          .map((user) => (
            <button
              type="button"
              key={user.id}
              onClick={() => handleSelectUser(user)}
            >
              <span className="conversation-avatar">
                {user.avatar}
              </span>

              <strong>{user.name}</strong>
            </button>
          ))}

        {availableUsers.length === 0 && (
          <p>No other registered users found.</p>
        )}
      </div>
    </div>
  </div>
)}

      {/* Main Messaging Layout */}
      <div className="messages-layout">

        {/* Left: Conversation List */}
        <aside className="messages-sidebar">

          <div className="conversation-heading">
            <h2>Conversations</h2>
            <button type="button" className="conversation-menu-btn">
              ⋯
            </button>
          </div>

          <div className="conversation-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search conversations..."
              aria-label="Search conversations"
            />
          </div>

          <div className="conversation-filters">
            <button className="filter-active" type="button">
              All
            </button>
            <button type="button">Unread</button>
            <button type="button">Groups</button>
          </div>

          <div className="conversation-list">

            {availableUsers.map((conversation) => (
              <button
                type="button"
                key={conversation.id}
                className={`conversation-item ${
                  activeConversation.id === conversation.id ? "selected" : ""
                }`}
                onClick={() => setActiveConversation(conversation)}
              >
                <div className="conversation-avatar">
                  {conversation.avatar}

                  {conversation.online && (
                    <span className="online-indicator"></span>
                  )}
                </div>

                <div className="conversation-info">
                  <div className="conversation-top">
                    <strong>{conversation.name}</strong>
                    <small>{conversationPreviews[conversation.id]?.time || ""}</small>
                  </div>

                  <div className="conversation-bottom">
                    <p>{conversationPreviews[conversation.id]?.message || "No messages yet"}</p>

                    {conversation.unread > 0 && (
                      <span className="unread-badge">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}

          </div>
        </aside>

        {/* Center: Chat Window */}
        <section className="messages-chat">
          <div className="chat-header">
            <div className="chat-user-info">
              <div className="chat-avatar">{activeConversation.avatar}</div>

              <div>
                <h2>{activeConversation.name}</h2>
                <span className="chat-user-status">
                  <span className="status-dot"></span>
                  {activeConversation.online ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            <div className="chat-header-actions">
              <button type="button" aria-label="Search messages">⌕</button>
              <button type="button" aria-label="More options">⋯</button>
            </div>
          </div>

          <div className="chat-body" ref={chatBodyRef}>
            <div className="chat-date-divider">
              <span>Today</span>
            </div>

            {(messagesByConversation[activeConversation.id] || []).map((message) => (
              <div className={`message-row ${message.sender}`} key={message.id}>
                {message.sender === "received" && (
                  <div className="message-avatar">{activeConversation.avatar}</div>
                )}

                <div className="message-content">
                  {message.deletedForEveryone ? (
                    <div className="message-bubble deleted-message">
                      This message was deleted
                    </div>
                  ) : (
                    <>
                      {message.replyToMessageId && (
                        <div className="reply-quoted-message">
                          <strong>
                            {message.replyToSenderId === auth.currentUser?.uid
                              ? "You"
                              : activeConversation.name}
                          </strong>
                          <p>{message.replyToText}</p>
                        </div>
                      )}

                      <div className="message-bubble">{message.text}</div>

                      <div className="message-menu-wrapper">
                        <button
                          type="button"
                          className="message-menu-trigger"
                          aria-label="Message options"
                          onClick={() =>
                            setOpenMessageMenuId((previous) =>
                              previous === message.id ? null : message.id
                            )
                          }
                        >
                          ⋮
                        </button>

                        {openMessageMenuId === message.id && (
                          <div className="message-options-menu">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTo(message);
                                setOpenMessageMenuId(null);
                              }}
                            >
                              ↩ Reply
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleDeleteForMe(message);
                                setOpenMessageMenuId(null);
                              }}
                            >
                              Delete for Me
                            </button>

                            {message.sender === "sent" && (
                              <button
                                type="button"
                                onClick={() => {
                                 setDeleteConfirmMessage(message);
                                  setOpenMessageMenuId(null);
                                }}
                              >
                                Delete for Everyone
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <small>
                        {message.time}
                        {message.sender === "sent" && !message.deletedForEveryone && (
                          <span className={`message-ticks ${message.status || "sent"}`}>
                            {message.status === "seen"
                              ? "✓✓"
                              : message.status === "delivered"
                                ? "✓✓"
                                : "✓"}
                          </span>
                        )}
                      </small>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Message Composer */}
          <div className="message-composer">
            <button type="button" aria-label="Attach file">
              ＋
            </button>

            <input
              type="text"
              placeholder="Write your message..."
              aria-label="Write your message"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            <button
             type="button"
             aria-label="Add emoji"
             onClick={() => setIsEmojiPickerOpen((previous) => !previous)}
            >
             😀
            </button>
            {isEmojiPickerOpen && (
           <div className="emoji-picker">
               {emojiOptions.map((emoji, index) => (
                <button
                 type="button"
                 key={`${emoji}-${index}`}
                 onClick={() => {
                 setMessageInput((previous) => previous + emoji);
                 setIsEmojiPickerOpen(false);
              }}
            >
              {emoji}
                </button>
              ))}
            </div>
            )}

            {replyingTo && (
              <div className="reply-preview">
                <div className="reply-preview-content">
                  <strong>
                    Replying to {replyingTo.sender === "sent" ? "yourself" : activeConversation.name}
                  </strong>
                  <p>{replyingTo.text}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  aria-label="Cancel reply"
                >
                  ✕
                </button>
              </div>
            )}

            <button
              type="button"
              className="send-message-btn"
              aria-label="Send message"
              onClick={handleSendMessage}
            >
              ➤
            </button>
          </div>
        </section>

        {/* Right: Contact Details */}
        <aside className="messages-contact-panel">

          <div className="contact-profile">
           <div className="contact-avatar">
            {activeConversation.avatar}
           </div>

           <h2>{activeConversation.name}</h2>

           <p>{activeConversation.online ? "Online" : "Offline"}</p>
          </div>

          <div className="contact-details">
            <h3>Contact Information</h3>

            <div className="contact-detail-item">
              <span>Email</span>
              <strong>{activeConversation.email}</strong>
            </div>

            <div className="contact-detail-item">
              <span>MeetNova Status</span>
              <strong>
                {activeConversation.online ? "Available" : "Offline"}
              </strong>
            </div>
          </div>

          <div className="contact-shared">
            <h3>Shared Media</h3>
            <p>No shared media yet.</p>
          </div>

        </aside>

      </div>
      {deleteConfirmMessage && (
  <div className="mn-modal-overlay">
    <div className="mn-delete-modal">
      <div className="mn-delete-icon">!</div>

      <h3>Delete Message?</h3>

      <p>
        Are you sure you want to delete this message for everyone?
        This action cannot be undone.
      </p>

      <div className="mn-delete-actions">
        <button
          type="button"
          className="mn-cancel-btn"
          onClick={() => setDeleteConfirmMessage(null)}
        >
          Cancel
        </button>

        <button
          type="button"
          className="mn-confirm-delete-btn"
          onClick={async () => {
            const message = deleteConfirmMessage;
            setDeleteConfirmMessage(null);
            await handleDeleteForEveryone(message);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default MessagesPage;