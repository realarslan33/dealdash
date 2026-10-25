export const mergeMessages = (...messageGroups) => {
  const messagesById = new Map();
  const messagesWithoutId = [];

  messageGroups.flat().forEach((message) => {
    if (!message) return;

    if (message._id) {
      messagesById.set(String(message._id), message);
    } else {
      messagesWithoutId.push(message);
    }
  });

  return [...messagesById.values(), ...messagesWithoutId].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return aTime - bTime;
  });
};
