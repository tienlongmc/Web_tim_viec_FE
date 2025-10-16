// ChatPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
  Channel as ChannelUI,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";

import {
  StreamChat,
  Channel as StreamChannel,
  UserResponse,
} from "stream-chat";

import toast from "react-hot-toast";
import { useAppSelector } from "@/redux/hooks";
import { callChatToken } from "@/config/api";
import { VideoCameraOutlined } from "@ant-design/icons";
import ChatLoader from "@/components/ChatLoader";
import "stream-chat-react/dist/css/v2/index.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_KEY;

const ChatPage = () => {
  const { id: targetUserIdParam } = useParams<{ id: string }>();

  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [loading, setLoading] = useState(true);

  const authUser = useAppSelector((state) => state.account.user);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: callChatToken,
  });

  const streamToken = tokenData;

  const targetUserId = useMemo(
    () => targetUserIdParam ?? "",
    [targetUserIdParam]
  );

  useEffect(() => {
    let isMounted = true;
    let client: StreamChat | null = null;
    let currChannel: StreamChannel | null = null;

    const initChat = async () => {
      try {
        if (!authUser?._id || !streamToken || !targetUserId) return;
        if (!STREAM_API_KEY) {
          toast.error(
            "Thiếu STREAM_API_KEY. Vui lòng cấu hình biến môi trường VITE_STREAM_API_KEY."
          );
          return;
        }

        client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.name,
            image: authUser.avatar,
          },
          streamToken as string
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");
        currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        if (!isMounted) return;
        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Không thể kết nối chat. Vui lòng thử lại.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initChat();

    return () => {
      isMounted = false;
      (async () => {
        try {
          await currChannel?.stopWatching();
        } catch {}
      })();
    };
  }, [
    authUser?._id,
    authUser?.name,
    authUser?.avatar,
    streamToken,
    targetUserId,
  ]);

  const handleVideoCall = () => {
    if (!channel || !chatClient) return;

    if (
      chatClient?.wsConnection?.isHealthy === false ||
      chatClient?.userID == null
    ) {
      toast.error("Kết nối chat đã ngắt, vui lòng tải lại trang.");
      return;
    }

    const callUrl = `${window.location.origin}/call/${channel.id}`;
    channel.sendMessage({
      text: `I've started a video call. Join me here: ${callUrl}`,
    });
    toast.success("Đã gửi link gọi video!");
  };

  if (loading || !chatClient || !channel) {
    return <ChatLoader />;
  }

  return (
    <div className="h-full">
      <Chat client={chatClient}>
        <ChannelUI channel={channel}>
          <div className="w-full" style={{ height: "39rem", width: "100%" }}>
            <div
              className="p-3 border-b flex items-center justify-end max-w-7xl mx-auto w-full absolute top-0"
              style={{ position: "relative" }}
            >
              <button
                style={{
                  position: "absolute",
                  width: "60px",
                  top: "10px",
                  right: "30px",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "15px",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={handleVideoCall}
                className="btn btn-success btn-sm text-white"
              >
                <VideoCameraOutlined
                  style={{ fontSize: 20, color: "#1677ff" }}
                />
              </button>
            </div>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </ChannelUI>
      </Chat>
    </div>
  );
};

export default ChatPage;
