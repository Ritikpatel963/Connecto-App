import React from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";

const ChatEmptyPage = () => (
  <MasterLayout>
    <Breadcrumb title="Chat" />
    <div className="card">
      <div className="card-body min-h-600-px d-flex flex-column align-items-center justify-content-center text-center">
        <span className="w-80-px h-80-px rounded-circle bg-primary-50 text-primary-600 d-flex align-items-center justify-content-center mb-20">
          <Icon icon="bi:chat-dots" className="text-4xl" />
        </span>
        <h5 className="mb-8">No conversation selected</h5>
        <p className="text-secondary-light mb-20">Choose a conversation to view messages.</p>
        <Link to="/chat-message" className="btn btn-primary-600">Open chat</Link>
      </div>
    </div>
  </MasterLayout>
);

export default ChatEmptyPage;
