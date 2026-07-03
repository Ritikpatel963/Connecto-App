import React from "react";
import { useNavigate } from "react-router-dom";
import { conversationsApi } from "../api/chat";
import AdminDataTable from "../components/AdminDataTable";
import { DateCell, IconButton, PersonCell } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import { BaseRecord } from "../types";

const ConversationsPage = () => {
  const navigate = useNavigate();
  const columns = [
    { key: "id", label: "Conversation" },
    { key: "user_one", label: "Participant one", render: (row: BaseRecord) => <PersonCell name={row.user_one} /> },
    { key: "user_two", label: "Participant two", render: (row: BaseRecord) => <PersonCell name={row.user_two} /> },
    { key: "messages", label: "Messages" },
    { key: "last_message_at", label: "Last activity", render: (row: BaseRecord) => <DateCell value={row.last_message_at} /> },
  ];
  return <><PageHeader title="Conversations" description="Browse conversation activity for moderation." icon="solar:chat-round-dots-outline" /><AdminDataTable<BaseRecord> queryKey={["conversations"]} queryFn={conversationsApi.list} columns={columns} initialSort={{ key: "last_message_at", direction: "desc" }} renderActions={(row) => <IconButton icon="solar:chat-round-dots-outline" title="View messages" onClick={() => navigate(`/chat/conversations/${row.id}`)} />} /></>;
};
export default ConversationsPage;
