import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import socketIO from "socket.io-client";
import { format } from "timeago.js";
import { backend_url, getImageUrl, server } from "../../server";
import { mergeMessages } from "../../utils/chatMessages";
import {
  FiSend,
  FiImage,
  FiArrowLeft,
  FiMessageSquare,
  FiSearch,
  FiUser,
  FiShoppingBag,
} from "react-icons/fi";
import { IoChatbubblesOutline } from "react-icons/io5";

const ENDPOINT = process.env.REACT_APP_SOCKET_URL || backend_url;
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

const resolveAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (/^https?:\/\//i.test(avatar)) return avatar;
  return `${getImageUrl(avatar.replace(/^\/+/, ""))}`;
};

const resolveImageUrl = (img) => {
  if (!img) return null;
  if (/^https?:\/\//i.test(img)) return img;
  return `${getImageUrl(img.replace(/^\/+/, ""))}`;
};

const DashboardMessages = () => {
  const { seller } = useSelector((state) => state.seller);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerProfiles, setCustomerProfiles] = useState({});
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

  // Fetch all conversations of the seller
  useEffect(() => {
    const getConversations = async () => {
      if (!seller?._id) return;
      try {
        const res = await axios.get(
          `${server}/conversation/get-all-conversation-seller/${seller._id}`,
          { withCredentials: true }
        );
        setConversations(res.data.conversations || []);
      } catch (error) {
        console.error("Failed to load seller conversations:", error);
      }
    };
    getConversations();
  }, [seller?._id]);

  // Socket: register seller as online
  useEffect(() => {
    if (seller?._id) {
      socketId.emit("addUser", seller._id);
      socketId.on("getUsers", (data) => {
        setOnlineUsers(data);
      });
    }
  }, [seller?._id]);

  const onlineCheck = useCallback(
    (chat) => {
      if (!chat?.members) return false;
      const chatMember = chat.members.find((member) => member !== seller?._id);
      return Boolean(onlineUsers.find((u) => u.userId === chatMember));
    },
    [seller?._id, onlineUsers]
  );

  // If a specific conversation was passed via URL or state
  useEffect(() => {
    if (targetId && conversations.length > 0) {
      const found = conversations.find((c) => c._id === targetId);
      if (found) {
        setCurrentChat((prev) => (prev?._id === found._id ? prev : found));
        setOpen(true);
        const customerId = found.members.find((m) => m !== seller?._id);

        if (customerId) {
          axios
            .get(`${server}/user/user-info/${customerId}`)
            .then((res) => {
              setUserData(res.data.user);
              setActiveStatus(onlineCheck(found));
              setCustomerProfiles((prev) => ({
                ...prev,
                [customerId]: res.data.user,
              }));
            })
            .catch((err) => console.error(err));
        }
      }
    } else if (!targetId) {
      setOpen(false);
      setCurrentChat(null);
      setUserData(null);
    }
  }, [targetId, conversations, seller?._id, onlineCheck]);

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

  // Send new text message
  const sendMessageHandler = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat?._id || !seller?._id) return;

    const receiverId = currentChat.members.find((m) => m !== seller._id);
    const text = newMessage.trim();

    const message = {
      sender: seller._id,
      text,
      conversationId: currentChat._id,
    };

    try {
      const res = await axios.post(
        `${server}/message/create-new-message`,
        message
      );
      setMessages((prev) => mergeMessages(prev, [res.data.message]));
      socketId.emit("sendMessage", {
        senderId: seller._id,
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
    if (!currentChat?._id || !seller?._id) return;
    socketId.emit("updateLastMessage", {
      lastMessage: msgText,
      lastMessageId: seller._id,
    });

    try {
      await axios.put(
        `${server}/conversation/update-last-message/${currentChat._id}`,
        {
          lastMessage: msgText,
          lastMessageId: seller._id,
        }
      );
      setConversations((prev) =>
        prev.map((c) =>
          c._id === currentChat._id
            ? {
                ...c,
                lastMessage: msgText,
                lastMessageId: seller._id,
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
    } catch (error) {
      console.error("Failed to update last message:", error);
    }
  };

  // Upload and send image
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentChat?._id || !seller?._id) return;

    const formData = new FormData();
    formData.append("images", file);
    formData.append("sender", seller._id);
    formData.append("text", "");
    formData.append("conversationId", currentChat._id);

    const receiverId = currentChat.members.find((m) => m !== seller._id);

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
        senderId: seller._id,
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
          lastMessageId: seller._id,
        }
      );
      setConversations((prev) =>
        prev.map((c) =>
          c._id === currentChat._id
            ? {
                ...c,
                lastMessage: "Photo",
                lastMessageId: seller._id,
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
    } catch (error) {
      console.error("Failed to send image:", error);
    }
  };

  const handleProfileLoaded = useCallback((userId, profile) => {
    setCustomerProfiles((prev) => {
      if (prev[userId]) return prev;
      return { ...prev, [userId]: profile };
    });
  }, []);

  // Filter conversations by customer name or last message
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter((c) => {
      const customerId = c.members?.find((id) => id !== seller?._id);
      const customer = customerProfiles[customerId];
      const customerName = customer?.name?.toLowerCase() || "";
      const lastMsg = c?.lastMessage?.toLowerCase() || "";
      return customerName.includes(q) || lastMsg.includes(q);
    });
  }, [conversations, searchQuery, customerProfiles, seller?._id]);

  return (
    <main className="w-full flex-1 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page Header */}
        <div className="flex flex-col hidden sm:flex gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3957db]">
              Seller Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#405d91] sm:text-3xl">
              Customer Messages
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#7183a3]">
              Communicate directly with your customers, answer order inquiries, and provide support.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>Live Chat Active</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#dce4f1] bg-white px-3.5 py-2 text-xs font-semibold text-[#405d91] shadow-xs">
              <FiMessageSquare className="text-[#3957db]" size={15} />
              <span>
                {conversations.length} {conversations.length === 1 ? "Conversation" : "Conversations"}
              </span>
            </div>
          </div>
        </div>

        {/* Main Inbox Card Container */}
        <div className={`overflow-hidden rounded-xl border border-[#dce4f1] bg-white shadow-sm grid grid-cols-1 ${
          open
            ? "lg:grid-cols-[360px_minmax(0,1fr)]"
            : "lg:grid-cols-[360px_minmax(0,1fr)]"
        } h-[calc(100vh-230px)] min-h-[580px] max-h-[850px]`}>
          {/* Conversation List Sidebar */}
          <div
            className={`h-full min-h-0 flex-col border-r border-[#dce4f1] bg-[#fdfefe] overflow-hidden ${
              open ? "hidden lg:flex" : "flex"
            }`}
          >
            <div className="shrink-0 border-b border-[#dce4f1] p-4 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#405d91]">Conversations</h2>
                  <p className="text-xs text-[#8a9dc2]">
                    {conversations.length} {conversations.length === 1 ? "Customer" : "Customers"} in chat
                  </p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3957db]">
                  <IoChatbubblesOutline size={18} />
                </span>
              </div>

              {/* Search filter input */}
              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a9dc2]"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search customers or messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-[#dce4f1] bg-[#f7f9fc] text-[#405d91] placeholder:text-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:bg-white focus:ring-1 focus:ring-[#3957db]"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[#edf2f9]">
              {filteredConversations && filteredConversations.length > 0 ? (
                filteredConversations.map((item, index) => (
                  <SellerMessageListItem
                    key={item._id || index}
                    data={item}
                    currentChat={currentChat}
                    setCurrentChat={setCurrentChat}
                    setOpen={setOpen}
                    me={seller?._id}
                    setUserData={setUserData}
                    online={onlineCheck(item)}
                    setActiveStatus={setActiveStatus}
                    onUserLoaded={handleProfileLoaded}
                  />
                ))
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-[#8a9dc2] h-full">
                  <FiMessageSquare size={36} className="text-[#c5d3ea] mb-2" />
                  <p className="text-sm font-semibold text-[#526b99]">
                    No conversations yet
                  </p>
                  <p className="text-xs mt-1 max-w-[240px] text-[#8a9dc2]">
                    When customers send inquiries about products or orders, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-[#8a9dc2] h-full">
                  <FiSearch size={28} className="text-[#c5d3ea] mb-2" />
                  <p className="text-xs font-semibold text-[#526b99]">
                    No conversations found
                  </p>
                  <p className="text-[11px] mt-0.5 text-[#8a9dc2]">
                    Try searching for a different customer name or message.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Thread Panel */}
          <div
            className={`h-full min-h-0 flex-col bg-white overflow-hidden ${
              open ? "flex" : "hidden lg:flex"
            }`}
          >
            {open && currentChat ? (
              <SellerChatThreadView
                userData={userData}
                activeStatus={activeStatus}
                setOpen={setOpen}
                messages={messages}
                seller={seller}
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
                  Choose a customer from the conversation list on the left to view messages and respond to inquiries.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

// Item row in the left-hand conversations list
const SellerMessageListItem = ({
  data,
  currentChat,
  setCurrentChat,
  setOpen,
  me,
  setUserData,
  online,
  setActiveStatus,
  onUserLoaded,
}) => {
  const [customer, setCustomer] = useState(null);
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const navigate = useNavigate();

  useEffect(() => {
    const customerId = data.members?.find((id) => id !== me);
    if (!customerId) return;

    let isMounted = true;
    axios
      .get(`${server}/user/user-info/${customerId}`)
      .then((res) => {
        if (isMounted) {
          const user = res.data?.user || null;
          setCustomer(user);
          if (onUserLoaded && user) {
            onUserLoaded(customerId, user);
          }
        }
      })
      .catch((err) => console.error(err));

    return () => {
      isMounted = false;
    };
  }, [me, data, onUserLoaded]);

  const isSelected = currentChat?._id === data._id;

  const handleClick = () => {
    setCurrentChat(data);
    setUserData(customer);
    setActiveStatus(online);
    setOpen(true);
    navigate(`/dashboard-messages?${data._id}`, { replace: !isMobile });
  };

  const avatarUrl = resolveAvatarUrl(customer?.avatar);

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
            alt={customer?.name || "Customer"}
            className="h-11 w-11 rounded-full object-cover border border-[#dce4f1]"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8edf6] text-sm font-bold text-[#3957db]">
            {customer?.name?.charAt(0)?.toUpperCase() || "C"}
          </div>
        )}
        {online && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-1">
          <h4 className="text-xs font-bold text-[#405d91] truncate">
            {customer?.name || "Marketplace Customer"}
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
const SellerChatThreadView = ({
  userData,
  activeStatus,
  setOpen,
  messages,
  seller,
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

  useLayoutEffect(() => {
    scrollToLatestMessage();
  }, [messages, scrollToLatestMessage]);

  const avatarUrl = resolveAvatarUrl(userData?.avatar);

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
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-full text-[#526b99] hover:bg-[#f1f4f9]"
            title="Back to conversations"
          >
            <FiArrowLeft size={18} />
          </button>

          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userData?.name || "Customer"}
                className="h-10 w-10 rounded-full object-cover border border-[#dce4f1]"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8edf6] text-sm font-bold text-[#3957db]">
                {userData?.name?.charAt(0)?.toUpperCase() || "C"}
              </div>
            )}
            {activeStatus && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#405d91]">
              {userData?.name || "Marketplace Customer"}
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

        <div className="flex items-center gap-2">
          {userData?.email && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[#dce4f1] bg-[#f8fbff] px-2.5 py-1 text-[11px] font-medium text-[#526b99]">
              <FiUser size={12} className="text-[#3957db]" />
              <span className="max-w-[150px] truncate">{userData.email}</span>
            </span>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[#fbfcfd]"
      >
        {messages && messages.length > 0 ? (
          messages.map((item, index) => {
            const isMe = item.sender === seller?._id;

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
                        {userData?.name?.charAt(0)?.toUpperCase() || "C"}
                      </div>
                    )}
                  </div>
                )}

                <div className="max-w-[75%] sm:max-w-[65%]">
                  {item.images && (
                    <div className="mb-1 overflow-hidden rounded-xl border border-[#dce4f1] bg-white">
                      <img
                        src={resolveImageUrl(item.images)}
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
              Start a conversation with {userData?.name || "the customer"}
            </p>
            <p className="text-[11px] text-[#8a9dc2] mt-0.5">
              Answer their questions regarding products, orders, or delivery.
            </p>
          </div>
        )}
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={sendMessageHandler}
        className="shrink-0 flex items-center gap-1.5 sm:gap-2 border-t border-[#dce4f1] bg-white p-2 sm:p-3 sm:px-4"
      >
        <div className="relative shrink-0">
          <input
            type="file"
            id="seller-chat-image-upload"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <label
            htmlFor="seller-chat-image-upload"
            title="Attach an image"
            className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md border border-[#dce4f1] bg-white text-[#526b99] transition hover:bg-[#f1f4f9] hover:text-[#3957db] cursor-pointer"
          >
            <FiImage size={16} className="sm:hidden" />
            <FiImage size={18} className="hidden sm:block" />
          </label>
        </div>

        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="h-8 sm:h-10 min-w-0 flex-1 rounded-md border border-[#dce4f1] bg-white px-2 sm:px-3.5 text-xs sm:text-sm text-[#405d91] placeholder:text-[#9caec9] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
        />

        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="flex h-8 sm:h-10 shrink-0 items-center justify-center gap-1 sm:gap-1.5 rounded-md bg-[#3957db] px-2.5 sm:px-4 text-xs font-semibold text-white transition hover:bg-[#2f49b7] disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3957db]/40"
        >
          <FiSend size={12} className="sm:hidden" />
          <FiSend size={14} className="hidden sm:block" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};

export default DashboardMessages;
