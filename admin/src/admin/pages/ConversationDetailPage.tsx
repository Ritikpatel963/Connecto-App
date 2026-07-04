import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { BaseRecord } from "../types";
import { messagesApi } from "../api/chat";
import PageHeader from "../components/PageHeader";
import { ErrorState, LoadingState } from "../components/PageStates";
import StatusBadge from "../components/StatusBadge";

const ConversationDetailPage = () => {
  const { id = "" } = useParams();
  const query = useQuery({ queryKey: ["conversation-messages", id], queryFn: () => messagesApi.list({ page: 1, pageSize: 100, filters: { conversation_id: id }, sortBy: "sent_at", sortDirection: "asc" }) });
  if (query.isLoading) return <LoadingState label="Loading messages..." />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => query.refetch()} />;

  return <><PageHeader title={`Conversation ${id}`} description="Read-only message viewer for moderation." icon="solar:chat-square-code-outline" /><div className="card"><div className="card-body p-24"><div className="d-flex flex-column gap-16">
    {query.data.data.length === 0 ? <p className="text-secondary-light mb-0">No messages in this conversation.</p> : query.data.data.map((message: BaseRecord) => <div className="border radius-12 p-16" key={String(message.id)}><div className="d-flex justify-content-between gap-3 mb-10"><div className="fw-semibold">{String(message.sender || message.sender_id)}</div><div className="d-flex align-items-center gap-2"><StatusBadge value={message.message_type} /><StatusBadge value={message.is_read ? "read" : "unread"} /></div></div><p className="mb-8">{String(message.content)}</p><span className="text-xs text-secondary-light">{String(message.sent_at)}</span></div>)}
  </div></div></div></>;
};
export default ConversationDetailPage;
