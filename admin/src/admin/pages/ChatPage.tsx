import React, { useState, useEffect } from "react";
import ChatMessageLayer from "../../components/ChatMessageLayer";
import PageHeader from "../components/PageHeader";
import { usersApi } from "../api/users";
import Select from "react-select";

const ChatPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await usersApi.list({ page: 1, pageSize: 100 });
        if (data) {
          setUsers(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUsers();
  }, []);

  const userOptions = users.map((user) => ({
    value: user.id,
    label: user.name,
    user: user,
  }));

  return (
    <div className="user-management-page chat-page">
      <PageHeader
        title="Chat"
        description="View user chats"
        icon="solar:chat-round-dots-outline"
      />
      
      <div className="card mb-24">
        <div className="card-body">
          <label className="form-label fw-semibold text-neutral-600 mb-2">Select a User to View Chat</label>
          <Select
            className="react-select"
            classNamePrefix="select"
            options={userOptions}
            value={userOptions.find(opt => opt.value === selectedUser?.id) || null}
            onChange={(selectedOption: any) => setSelectedUser(selectedOption?.user || null)}
            isClearable
            isSearchable
            placeholder="Type to filter and choose a user..."
            styles={{
              control: (baseStyles) => ({
                ...baseStyles,
                borderColor: '#e5e7eb',
                padding: '4px',
                borderRadius: '8px'
              })
            }}
          />
        </div>
      </div>

      <ChatMessageLayer 
        users={users}
        selectedUser={selectedUser} 
        setSelectedUser={setSelectedUser} 
      />
    </div>
  );
};

export default ChatPage;