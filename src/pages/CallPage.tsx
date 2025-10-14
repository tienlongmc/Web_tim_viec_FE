// src/pages/CallPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  StreamVideo,
  CallControls,
  CallParticipantsList,
  SpeakerLayout,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { callChatToken } from "@/config/api"; // hàm backend cấp token
import { useAppSelector } from "@/redux/hooks";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ChatLoader from "@/components/ChatLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_KEY;

const CallPage = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const authUser = useAppSelector((state) => state.account.user);
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);

  const {
    data: tokenData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["streamToken"],
    queryFn: callChatToken, // backend trả { token: string }
    enabled: !!authUser?._id,
  });
  useEffect(() => {
    let videoClient: StreamVideoClient | null = null;
    let activeCall: any = null;

    const initCall = async () => {
      try {
        if (!authUser?._id || !tokenData || !channelId) return;
        if (!STREAM_API_KEY) {
          toast.error("Thiếu STREAM_API_KEY trong biến môi trường!");
          return;
        }

        const token = tokenData; // nếu backend trả trực tiếp token string

        console.log("🎯 Stream Token:", token);

        // 1️⃣ Tạo client Stream Video
        videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: {
            id: authUser._id,
            name: authUser.name,
            image: authUser.avatar || undefined,
          },
          token,
        });

        // 2️⃣ Lấy call theo channelId
        activeCall = videoClient.call("default", channelId);
        await activeCall.join({ create: true });

        console.log("✅ Joined call:", activeCall);

        setClient(videoClient);
        setCall(activeCall);
      } catch (error) {
        console.error("❌ Lỗi khi khởi tạo cuộc gọi:", error);
        toast.error("Không thể khởi tạo cuộc gọi.");
      }
    };

    initCall();

    return () => {
      activeCall?.leave();
      videoClient?.disconnectUser();
    };
  }, [authUser?._id, channelId, tokenData]);

  if (isLoading || !client || !call) return <ChatLoader></ChatLoader>;

  if (isError)
    return (
      <div className="p-10 text-center text-red-500">
        ❌ Không thể lấy token Stream.
      </div>
    );

  return (
    <StreamVideo client={client}>
      <StreamTheme>
        <StreamCall call={call}>
          <div className="h-screen w-full flex flex-col">
            <SpeakerLayout />
            <CallControls />
            {/* <CallParticipantsList /> */}
          </div>
        </StreamCall>
      </StreamTheme>
    </StreamVideo>
  );
};

export default CallPage;
