import React from "react";
import ChatMessageLayer from "../../components/ChatMessageLayer";
import PageHeader from "../components/PageHeader";

const ChatPage = () => <>
  <PageHeader
    title="Chat"
    description="Original themed chat workspace for admin communication."
    icon="solar:chat-round-dots-outline"
  />
  <ChatMessageLayer />
</>;

export default ChatPage;