import React from "react";
import ChatProfileLayer from "../../components/ChatProfileLayer";
import PageHeader from "../components/PageHeader";

const ChatProfilePage = () => <>
  <PageHeader
    title="Chat Profile"
    description="Manage the profile and availability shown in chat."
    icon="solar:user-id-outline"
  />
  <ChatProfileLayer />
</>;

export default ChatProfilePage;