import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import { useSelector } from "react-redux";
import socketIO from "socket.io-client";
import { format } from "timeago.js";
import { backend_url, server } from "../server";
import { mergeMessages } from "../utils/chatMessages";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiSend,
  FiImage,
  FiArrowLeft,
  FiMessageSquare,
  FiShoppingBag,
} from "react-icons/fi";
import { IoChatbubblesOutline } from "react-icons/io5";

const ENDPOINT = process.env.REACT_APP_SOCKET_URL || backend_url;
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

const UserInbox = () => {
  const { user } = useSelector((state) => state.user);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const currentChatRef = useRef(currentChat);
  currentChatRef.current = currentChat;

  const { id: paramId } = useParams();
  const location = useLocation();
  const searchId = location.search
    ? location.search.replace("?", "").split("&")[0]
    : null;
  const targetId = paramId || location.state?.conversationId || searchId;

  // Socket: Listen for incoming messages
  useEffect(() => {
    const handleGetMessage = (data) => {
      const message = data.message || data;
      const senderId = message.sender || data.senderId;
      const activeChat = currentChatRef.current;
      const belongsToActiveChat = activeChat?.members?.some(
        (member) => String(member) === String(senderId)
      );
      const conversationId =
        message.conversationId ||
        data.conversationId ||
        (belongsToActiveChat ? activeChat._id : null);
      if (!conversationId) return;

      const incomingMessage = {
        ...message,
        sender: senderId,
        conversationId,
        createdAt: message.createdAt || new Date().toISOString(),
      };

      if (currentChatRef.current?._id === conversationId) {
        setMessages((prev) => mergeMessages(prev, [incomingMessage]));
      }

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation._id === conversationId
            ? {
                ...conversation,
                lastMessage:
                  incomingMessage.text ||
                  (incomingMessage.images ? "Photo" : ""),
                lastMessageId: incomingMessage.sender,
                updatedAt: incomingMessage.createdAt || new Date().toISOString(),
              }
            : conversation
        )
      );
    };
    socketId.on("getMessage", handleGetMessage);
    return () => {
      socketId.off("getMessage", handleGetMessage);
    };
  }, []);

  // Fetch all conversations of the user
  useEffect(() => {
    const getConversations = async () => {
      if (!user?._id) return;
      try {
        const response = await axios.get(
          `${server}/conversation/get-all-conversation-user/${user._id}`,
          { withCredentials: true }
        );
        setConversations(response.data.conversations || []);
      } catch (error) {
        console.error("Failed to load user conversations:", error);
      }
    };
    getConversations();
  }, [user?._id]);

  // Socket: register online user
  useEffect(() => {
    if (user?._id) {
      socketId.emit("addUser", user._id);
      socketId.on("getUsers", (data) => {
        setOnlineUsers(data);
      });
    }
  }, [user?._id]);

  const onlineCheck = useCallback(
    (chat) => {
      if (!chat?.members) return false;
      const chatMember = chat.members.find((member) => member !== user?._id);
      return Boolean(onlineUsers.find((u) => u.userId === chatMember));
    },
    [user?._id, onlineUsers]
  );

  // If a specific conversation was passed via URL or state (e.g. from Order details "Chat with Seller")
  useEffect(() => {
    if (targetId && conversations.length > 0) {
      const found = conversations.find((c) => c._id === targetId);
      if (found) {
        setCurrentChat((prev) => (prev?._id === found._id ? prev : found));
        setOpen(true);
        const sellerId =
          location.state?.sellerId ||
          found.members.find((m) => m !== user?._id);

        if (sellerId) {
          axios
            .get(`${server}/shop/get-shop-info/${sellerId}`)
            .then((res) => {
              setUserData(res.data.shop);
              setActiveStatus(onlineCheck(found));
            })
            .catch((err) => console.error(err));
        }
      }
    } else if (!targetId) {
      setOpen(false);
      setCurrentChat(null);
      setUserData(null);
    }
  }, [targetId, conversations, user?._id, location.state?.sellerId, onlineCheck]);

  // Fetch messages for current selected chat
  const currentConversationId = currentChat?._id;
  useEffect(() => {
    let isActive = true;
    const getMessages = async () => {
      if (!currentConversationId) return;
      try {
        const response = await axios.get(
          `${server}/message/get-all-messages/${currentConversationId}`
        );
        if (!isActive) return;
        setMessages((prev) =>
          mergeMessages(
            response.data.messages || [],
            prev.filter((message) => message.conversationId === currentConversationId)
          )
        );
      } catch (error) {
        console.error("Failed to get messages:", error);
      }
    };
    getMessages();
    return () => {
      isActive = false;
    };
  }, [currentConversationId]);

  // Send new message
  const sendMessageHandler = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat?._id || !user?._id) return;

    const text = newMessage.trim();
    const message = {
      sender: user._id,
      text,
      conversationId: currentChat._id,
    };

    const receiverId = currentChat.members.find((m) => m !== user._id);

    try {
      const res = await axios.post(
        `${server}/message/create-new-message`,
        message
      );
      setMessages((prev) => mergeMessages(prev, [res.data.message]));
      socketId.emit("sendMessage", {
        senderId: user._id,
        receiverId,
        conversationId: currentChat._id,
        message: res.data.message,
        text: res.data.message.text,
        images: res.data.message.images,
      });
      updateLastMessage(text);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const updateLastMessage = async (msgText) => {
    if (!currentChat?._id || !user?._id) return;
    socketId.emit("updateLastMessage", {
      lastMessage: msgText,
      lastMessageId: user._id,
    });

    try {
      await axios.put(
        `${server}/conversation/update-last-message/${currentChat._id}`,
        {
          lastMessage: msgText,
          lastMessageId: user._id,
        }
      );
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation._id === currentChat._id
            ? {
                ...conversation,
                lastMessage: msgText,
                lastMessageId: user._id,
                updatedAt: new Date().toISOString(),
              }
            : conversation
        )
      );
    } catch (error) {
      console.error("Failed to update last message:", error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentChat?._id || !user?._id) return;

    const formData = new FormData();
    formData.append("images", file);
    formData.append("sender", user._id);
    formData.append("text", "");
    formData.append("conversationId", currentChat._id);

    const receiverId = currentChat.members.find((m) => m !== user._id);

    try {
      const res = await axios.post(
        `${server}/message/create-new-message`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMessages((prev) => mergeMessages(prev, [res.data.message]));
      socketId.emit("sendMessage", {
        senderId: user._id,
        receiverId,
        conversationId: currentChat._id,
        message: res.data.message,
        text: res.data.message.text,
        images: res.data.message.images,
      });
      await axios.put(
        `${server}/conversation/update-last-message/${currentChat._id}`,
        {
          lastMessage: "Photo",
          lastMessageId: user._id,
        }
      );
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation._id === currentChat._id
            ? {
                ...conversation,
                lastMessage: "Photo",
                lastMessageId: user._id,
                updatedAt: new Date().toISOString(),
              }
            : conversation
        )
      );
    } catch (error) {
      console.error("Failed to send image:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#f7f9fc]">
      <Header />
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto w-11/12 max-w-[1200px]">
          {/* Header Title */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3957db]">
                <IoChatbubblesOutline size={22} />
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#405d91] sm:text-2xl">
                  Messages & Support
                </h1>
                <p className="text-xs text-[#8a9dc2]">
                  Chat directly with sellers and track order inquiries
                </p>
              </div>
            </div>
          </div>

          {/* Main Inbox Card Container */}
          <div className="overflow-hidden rounded-xl border border-[#dce4f1] bg-white shadow-sm grid grid-cols-1 md:grid-cols-[340px_minmax(0,1fr)] h-[calc(100vh-210px)] min-h-[500px] max-h-[850px]">
            {/* Conversation List Sidebar */}
            <div
              className={`h-full min-h-0 flex-col border-r border-[#dce4f1] bg-[#fdfefe] overflow-hidden ${
                open ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="shrink-0 border-b border-[#dce4f1] p-4 bg-white">
                <h2 className="text-sm font-bold text-[#405d91]">Conversations</h2>
                <p className="text-xs text-[#8a9dc2]">
                  {conversations.length} {conversations.length === 1 ? "Shop" : "Shops"} in chat
                </p>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[#edf2f9]">
                {conversations && conversations.length > 0 ? (
                  conversations.map((item, index) => (
                    <MessageListItem
                      key={item._id || index}
                      data={item}
                      currentChat={currentChat}
                      setCurrentChat={setCurrentChat}
                      setOpen={setOpen}
                      me={user?._id}
                      setUserData={setUserData}
                      online={onlineCheck(item)}
                      setActiveStatus={setActiveStatus}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-[#8a9dc2] h-full">
                    <FiMessageSquare size={36} className="text-[#c5d3ea] mb-2" />
                    <p className="text-sm font-semibold text-[#526b99]">
                      No conversations yet
                    </p>
                    <p className="text-xs mt-1">
                      When you click "Chat with Seller" from an order or product, conversations will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Thread Panel */}
            <div
              className={`h-full min-h-0 flex-col bg-white overflow-hidden ${
                open ? "flex" : "hidden md:flex"
              }`}
            >
              {open && currentChat ? (
                <ChatThreadView
                  userData={userData}
                  activeStatus={activeStatus}
                  setOpen={setOpen}
                  messages={messages}
                  user={user}
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  sendMessageHandler={sendMessageHandler}
                  handleImageUpload={handleImageUpload}
                />
              ) : (
                <div className="hidden md:flex flex-col items-center justify-center h-full p-8 text-center text-[#8a9dc2] bg-[#fbfcfd]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef2ff] text-[#3957db] mb-4">
                    <IoChatbubblesOutline size={32} />
                  </div>
                  <h3 className="text-base font-bold text-[#405d91]">
                    Select a conversation
                  </h3>
                  <p className="max-w-xs text-xs text-[#8a9dc2] mt-1.5 leading-relaxed">
                    Choose a shop from the conversation list on the left to view messages and ask questions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Item row in the left-hand conversations list
const MessageListItem = ({
  data,
  currentChat,
  setCurrentChat,
  setOpen,
  me,
  setUserData,
  online,
  setActiveStatus,
}) => {
  const [shop, setShop] = useState(null);
  const navigate = useNavigate();
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  useEffect(() => {
    const shopId = data.members?.find((id) => id !== me);
    if (!shopId) return;

    let isMounted = true;
    axios
      .get(`${server}/shop/get-shop-info/${shopId}`)
      .then((res) => {
        if (isMounted) setShop(res.data?.shop || null);
      })
      .catch((err) => console.error(err));

    return () => {
      isMounted = false;
    };
  }, [me, data]);

  const isSelected = currentChat?._id === data._id;

  const handleClick = () => {
    setCurrentChat(data);
    setUserData(shop);
    setActiveStatus(online);
    setOpen(true);
    navigate(`/inbox?${data._id}`, { replace: !isMobile });
  };

  const avatarUrl = shop?.avatar
    ? /^https?:\/\//i.test(shop.avatar)
      ? shop.avatar
      : `${backend_url}${shop.avatar.replace(/^\/+/, "")}`
    : null;

  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-3 p-3.5 transition cursor-pointer ${
        isSelected
          ? "border-l-4 border-[#3957db] bg-[#eef2ff]/70"
          : "hover:bg-[#f8fbff]"
      }`}
    >
      <div className="relative shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={shop?.name || "Shop"}
            className="h-11 w-11 rounded-full object-cover border border-[#dce4f1]"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8edf6] text-sm font-bold text-[#3957db]">
            {shop?.name?.charAt(0)?.toUpperCase() || "S"}
          </div>
        )}
        {online && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-1">
          <h4 className="text-xs font-bold text-[#405d91] truncate">
            {shop?.name || "Marketplace Seller"}
          </h4>
          {data.updatedAt && (
            <span className="text-[10px] text-[#8a9dc2] shrink-0">
              {format(data.updatedAt)}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-[#526b99] truncate">
          {data?.lastMessageId === me ? "You: " : ""}
          {data?.lastMessage || "Started a conversation"}
        </p>
      </div>
    </div>
  );
};

// Right-hand active chat pane
const ChatThreadView = ({
  userData,
  activeStatus,
  setOpen,
  messages,
  user,
  newMessage,
  setNewMessage,
  sendMessageHandler,
  handleImageUpload,
}) => {
  const navigate = useNavigate();
  const messagesContainerRef = useRef(null);

  const scrollToLatestMessage = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, []);

  // Scroll only the internal messages container, never the window/page
  useLayoutEffect(() => {
    scrollToLatestMessage();
  }, [messages, scrollToLatestMessage]);

  const avatarUrl = userData?.avatar
    ? /^https?:\/\//i.test(userData.avatar)
      ? userData.avatar
      : `${backend_url}${userData.avatar.replace(/^\/+/, "")}`
    : null;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Thread Header */}
      <div className="shrink-0 flex items-center justify-between border-b border-[#dce4f1] bg-white p-3.5 sm:px-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate(-1);
            }}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-full text-[#526b99] hover:bg-[#f1f4f9]"
          >
            <FiArrowLeft size={18} />
          </button>

          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userData?.name || "Shop"}
                className="h-10 w-10 rounded-full object-cover border border-[#dce4f1]"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8edf6] text-sm font-bold text-[#3957db]">
                {userData?.name?.charAt(0)?.toUpperCase() || "S"}
              </div>
            )}
            {activeStatus && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#405d91]">
              {userData?.name || "Marketplace Seller"}
            </h3>
            <span className="text-[11px] text-[#8a9dc2]">
              {activeStatus ? (
                <span className="text-emerald-600 font-medium">Active now</span>
              ) : (
                "Offline"
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[#fbfcfd]"
      >
        {messages && messages.length > 0 ? (
          messages.map((item, index) => {
            const isMe = item.sender === user?._id;

            return (
              <div
                key={item._id || index}
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && (
                  <div className="mr-2.5 shrink-0 self-end">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        className="h-7 w-7 rounded-full object-cover border border-[#dce4f1]"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8edf6] text-[10px] font-bold text-[#3957db]">
                        {userData?.name?.charAt(0)?.toUpperCase() || "S"}
                      </div>
                    )}
                  </div>
                )}

                <div className={`max-w-[75%] sm:max-w-[65%]`}>
                  {item.images && (
                    <div className="mb-1 overflow-hidden rounded-xl border border-[#dce4f1] bg-white">
                      <img
                        src={
                          /^https?:\/\//i.test(item.images)
                            ? item.images
                            : `${backend_url}${item.images.replace(/^\/+/, "")}`
                        }
                        alt="Attachment"
                        className="max-h-60 w-auto object-cover"
                        onLoad={scrollToLatestMessage}
                      />
                    </div>
                  )}

                  {item.text && (
                    <div
                      className={`px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                        isMe
                          ? "rounded-2xl rounded-tr-sm bg-[#3957db] text-white"
                          : "rounded-2xl rounded-tl-sm border border-[#dce4f1] bg-white text-[#405d91] shadow-xs"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{item.text}</p>
                    </div>
                  )}

                  <span
                    className={`block text-[10px] text-[#8a9dc2] mt-1 ${
                      isMe ? "text-right" : "text-left"
                    }`}
                  >
                    {item.createdAt ? format(item.createdAt) : "Just now"}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-[#8a9dc2] py-12">
            <FiShoppingBag size={28} className="text-[#c5d3ea] mb-2" />
            <p className="text-xs font-medium text-[#526b99]">
              Start a conversation with {userData?.name || "the seller"}
            </p>
            <p className="text-[11px] text-[#8a9dc2] mt-0.5">
              Ask questions regarding your order or shipping updates.
            </p>
          </div>
        )}
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={sendMessageHandler}
        className="shrink-0 border-t border-[#dce4f1] bg-white p-3 sm:px-4 flex items-center gap-2"
      >
        <div className="relative">
          <input
            type="file"
            id="chat-image-upload"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <label
            htmlFor="chat-image-upload"
            title="Attach an image"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[#dce4f1] bg-white text-[#526b99] transition hover:bg-[#f1f4f9] hover:text-[#3957db] cursor-pointer"
          >
            <FiImage size={18} />
          </label>
        </div>

        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="h-10 flex-1 rounded-md border border-[#dce4f1] bg-white px-3.5 text-xs sm:text-sm text-[#405d91] placeholder:text-[#9caec9] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
        />

        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="flex h-10 items-center justify-center gap-1.5 rounded-md bg-[#3957db] px-4 text-xs font-semibold text-white transition hover:bg-[#2f49b7] disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3957db]/40"
        >
          <FiSend size={14} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};

export default UserInbox;
