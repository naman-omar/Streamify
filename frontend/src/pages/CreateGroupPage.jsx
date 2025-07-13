import React, { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";

function CreateGroupPage() {
  const [groupName, setGroupName] = useState("");
  const [groupPhoto, setGroupPhoto] = useState(null); // file or URL
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search users as searchTerm changes (debounce recommended)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const fetchUsers = async () => {
      try {
        const { data } = await axiosInstance.get(`/users/search?query=${encodeURIComponent(searchTerm)}`);
        // Filter out users already selected
        const filtered = data.filter(u => !selectedMembers.some(m => m._id === u._id));
        setSearchResults(filtered);
      } catch (err) {
        console.error("Search error", err);
      }
    };

    // simple debounce
    const timeoutId = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedMembers]);

  // Add user to selected members
  const addMember = (user) => {
    setSelectedMembers(prev => [...prev, user]);
    setSearchTerm("");
    setSearchResults([]);
  };

  // Remove member from selected list
  const removeMember = (userId) => {
    setSelectedMembers(prev => prev.filter(m => m._id !== userId));
  };

  // Handle photo upload/change (optional)
  const onPhotoChange = (e) => {
    if (e.target.files.length > 0) {
      setGroupPhoto(e.target.files[0]);
    }
  };

  // Submit form to create group
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedMembers.length < 1) {
      alert("Please enter group name and add at least one member.");
      return;
    }
    setIsSubmitting(true);

    try {
      // If you want to upload photo, handle it here (to S3 or your backend)
      // For now we’ll skip that part and just send member IDs and group name
      
      const memberIds = selectedMembers.map(m => m._id);
      const response = await axiosInstance.post("/chat/group/create", {
        groupName,
        memberIds,
      });

      alert("Group created successfully!");
      // Optionally redirect or clear form here

    } catch (err) {
      console.error("Create group error:", err);
      alert("Failed to create group.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Group</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Group Name */}
        <div>
          <label className="block font-semibold mb-1">Group Name</label>
          <input
            type="text"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Enter group name"
            required
          />
        </div>

        {/* Group Photo */}
        <div>
          <label className="block font-semibold mb-1">Group Photo (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={onPhotoChange}
          />
          {groupPhoto && (
            <img
              src={URL.createObjectURL(groupPhoto)}
              alt="Group preview"
              className="mt-2 w-32 h-32 rounded-full object-cover"
            />
          )}
        </div>

        {/* Search Users */}
        <div>
          <label className="block font-semibold mb-1">Add Members</label>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="input input-bordered w-full"
          />

          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <ul className="border border-base-300 rounded mt-1 max-h-48 overflow-auto bg-base-100">
              {searchResults.map(user => (
                <li
                  key={user._id}
                  className="p-2 cursor-pointer hover:bg-base-200"
                  onClick={() => addMember(user)}
                >
                  {user.fullName}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selected Members */}
        {selectedMembers.length > 0 && (
          <div>
            <label className="block font-semibold mb-1">Selected Members</label>
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map(user => (
                <div
                  key={user._id}
                  className="badge badge-outline flex items-center gap-2"
                >
                  {user.fullName}
                  <button
                    type="button"
                    className="btn btn-xs btn-circle btn-error"
                    onClick={() => removeMember(user._id)}
                    aria-label={`Remove ${user.fullName}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div>
          <button
            type="submit"
            className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}
            disabled={isSubmitting}
          >
            Create Group
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateGroupPage;
