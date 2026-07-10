import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// @ts-ignore
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import PageHeader from "../components/PageHeader";
import { settingsApi } from "../api/settings";

const CMSPage = () => {
  const queryClient = useQueryClient();
  const [privacyPolicy, setPrivacyPolicy] = useState<string>("");
  const [helpSupport, setHelpSupport] = useState<string>("");

  const { data: privacyData, isLoading: privacyLoading } = useQuery({
    queryKey: ["settings", "privacy_policy"],
    queryFn: () => settingsApi.get("privacy_policy"),
  });

  const { data: helpData, isLoading: helpLoading } = useQuery({
    queryKey: ["settings", "help_support"],
    queryFn: () => settingsApi.get("help_support"),
  });

  useEffect(() => {
    if (privacyData) setPrivacyPolicy(privacyData);
    if (helpData) setHelpSupport(helpData);
  }, [privacyData, helpData]);

  const saveContent = useMutation({
    mutationFn: async () => {
      await settingsApi.set("privacy_policy", privacyPolicy);
      await settingsApi.set("help_support", helpSupport);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Content saved successfully!");
    },
    onError: (error: Error) => toast.error(error.message)
  });

  // Basic modules for Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <>
      <style>{`
        .quill-editor-container .ql-toolbar button {
          padding: 3px 5px !important;
          background: transparent !important;
          border: none !important;
          height: 24px !important;
          width: 28px !important;
        }
        .quill-editor-container .ql-toolbar button svg {
          display: block;
        }
        .quill-editor-container .ql-container {
          min-height: 300px;
          font-size: 16px;
        }
      `}</style>
      <PageHeader 
        title="Content Management" 
        description="Manage the content displayed in the mobile app screens like Privacy Policy and Help & Support." 
        icon="solar:document-text-outline" 
      />
      
      <div className="card mb-4">
        <div className="card-header bg-neutral-50 py-16 px-24 d-flex align-items-center justify-content-between">
          <h6 className="mb-0 text-lg">Privacy & Security Policy</h6>
        </div>
        <div className="card-body p-24 quill-editor-container">
          {privacyLoading ? (
            <p>Loading...</p>
          ) : (
            <ReactQuill 
              theme="snow" 
              value={privacyPolicy} 
              onChange={setPrivacyPolicy} 
              modules={modules}
            />
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-neutral-50 py-16 px-24 d-flex align-items-center justify-content-between">
          <h6 className="mb-0 text-lg">Help & Support</h6>
        </div>
        <div className="card-body p-24 quill-editor-container">
          {helpLoading ? (
            <p>Loading...</p>
          ) : (
            <ReactQuill 
              theme="snow" 
              value={helpSupport} 
              onChange={setHelpSupport} 
              modules={modules}
            />
          )}
        </div>
      </div>

      <div className="d-flex justify-content-end mb-24">
        <button 
          className="btn btn-primary-600 px-32 py-12" 
          onClick={() => saveContent.mutate()}
          disabled={saveContent.isPending}
        >
          {saveContent.isPending ? 'Saving...' : 'Save All Content'}
        </button>
      </div>
    </>
  );
};

export default CMSPage;
