import React from "react";
import ChatMessageLayer from "../../components/ChatMessageLayer";
import PageHeader from "../components/PageHeader";

const ChatPage = () => <div className="user-management-page chat-page">
  <PageHeader
    title="Chat"
    description="Original themed chat workspace for admin communication."
    icon="solar:chat-round-dots-outline"
  />
  <ChatMessageLayer />
</div>;

export default ChatPage;