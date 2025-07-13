import { generateStreamToken, streamClient } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    const token = generateStreamToken(req.user.id);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// POST /api/chat/group/:channelId/remove


// POST /api/chat/group/create
export const createGroup = async (req, res) => {
  const { groupName, memberIds } = req.body;
  const userId = req.user._id.toString();
  const timestamp = Date.now();
  const channelId = `group-${userId}-${timestamp}`;

  if (!Array.isArray(memberIds)) {
    return res.status(400).json({ message: "memberIds must be an array" });
  }

  const allMembers = Array.from(new Set([...memberIds, userId]));

  if (!groupName || allMembers.length < 2) {
    return res.status(400).json({ message: "groupName and at least 2 memberIds (including creator) are required" });
  }

  try {
    const channel = streamClient.channel("messaging", channelId, {
      name: groupName,
      members: allMembers,
      created_by_id: userId, // <-- required for server-side auth
    });

    await channel.watch();

    res.status(201).json({ success: true, channel: channel.data });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const addGroupMembers = async (req, res) => {
  const { channelId, newMembers } = req.body;

  try {
    const channel = streamClient.channel('messaging', channelId);

    await channel.addMembers(newMembers);
    await channel.watch();

    res.status(200).json({ success: true, message: 'Members added', channel: channel.data });
  } catch (error) {
    console.error('Error adding members:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const removeGroupMembers = async (req, res) => {
  const { channelId, membersToRemove } = req.body;

  try {
    const channel = streamClient.channel('messaging', channelId);

    await channel.removeMembers(membersToRemove);
    await channel.watch();

    res.status(200).json({ success: true, message: 'Members removed', channel: channel.data });
  } catch (error) {
    console.error('Error removing members:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};








