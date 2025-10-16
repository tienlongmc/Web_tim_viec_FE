// ChatPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
// import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
// import { getStreamToken } from "../lib/api";

import {
  Channel as ChannelUI,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";

import { StreamChat, Channel as StreamChannel } from "stream-chat";
// DefaultGenerics,

import toast from "react-hot-toast";
import { useAppSelector } from "@/redux/hooks";
import { callChatToken } from "@/config/api";
import { VideoCameraOutlined } from "@ant-design/icons";
import ChatLoader from "@/components/ChatLoader";
import "stream-chat-react/dist/css/v2/index.css";

// import ChatLoader from "../components/ChatLoader";
// import CallButton from "../components/CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_KEY;

const ChatPage = () => {
  const { id: targetUserIdParam } = useParams<{ id: string }>();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const authUser = useAppSelector((state) => state.account.user);

  const enabled = !!authUser?._id;
  // console.log("hihi", enabled);
  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: callChatToken, // cần trả về { token: string }
    // enabled,
  });
  useEffect(() => {
    const initChat = async () => {
      const res = await callChatToken();
      const token = res;
      console.log("Token:", token);
    };
    initChat();
  }, []);

  // console.log(mutation.data);
  // console.log("diy me m: ", tokenData);
  const streamToken = tokenData;
  const targetUserId = useMemo(
    () => targetUserIdParam ?? "",
    [targetUserIdParam]
  );

  useEffect(() => {
    let isMounted: any = true;
    let client: any = null;
    let currChannel: any = null;

    const initChat = async () => {
      try {
        // Kiểm tra điều kiện cần đủ
        if (!authUser?._id || !streamToken || !targetUserId) return;
        if (!STREAM_API_KEY) {
          toast.error(
            "Thiếu STREAM_API_KEY. Vui lòng cấu hình biến môi trường VITE_STREAM_API_KEY."
          );
          return;
        }

        // 1) Tạo/khởi tạo client
        client = StreamChat.getInstance(STREAM_API_KEY);

        // 2) Kết nối user hiện tại
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.name,
            image: authUser.avatar,
          },
          streamToken
        );

        // 3) Tạo channel ID ổn định giữa 2 user
        const channelId = [authUser._id, targetUserId].sort().join("-");

        // 4) Khởi tạo channel
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
      // Cleanup: dừng watch và disconnect user
      (async () => {
        try {
          await currChannel?.stopWatching();
        } catch {}
        // try {
        //   // if (window.location.pathname !== "/chat") {
        //   //   await client?.disconnectUser();
        //   // }
        // } catch {}
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
    console.log("handleVideoCall", channel);
    if (!channel) return;
    if (
      chatClient?.wsConnection?.isHealthy === false ||
      chatClient?.userID == null
    ) {
      toast.error("Kết nối chat đã ngắt, vui lòng tải lại trang.");
      console.log("wsConnection not healthy");
      return;
    }
    const callUrl = `${window.location.origin}/call/${channel.id}`;
    channel.sendMessage({
      text: `I've started a video call. Join me here: ${callUrl}`,
    });
    toast.success("Đã gửi link gọi video!");
  };

  if (loading || !chatClient || !channel) {
    return <ChatLoader></ChatLoader>;
    // (
    //   <div>
    //     <p>loading: {String(loading)}</p>
    //     <p>chatClient: {chatClient ? "✅ Có client" : "❌ null"}</p>
    //     <p>
    //       channel:{" "}
    //       {streamToken
    //         ? `✅ ${tokenData} Có channel`
    //         : `✅ ${tokenData} ko channel`}
    //     </p>
    //   </div>
    // );
  }

  return (
    <div className="h-full">
      <Chat client={chatClient}>
        <ChannelUI channel={channel}>
          <div className="w-full" style={{ height: "39rem", width: "100%" }}>
            {/* <CallButton handleVideoCall={handleVideoCall} /> */}
            <div
              className="p-3 border-b flex items-center justify-end max-w-7xl mx-auto w-full absolute top-0"
              style={{ position: "relative" }}
            >
              <button
                style={{
                  position: "absolute",
                  width: "60px",
                  top: "10px",
                  right: "30px", // cách bên phải 30px
                  // backgroundColor: "#1677ff",
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
