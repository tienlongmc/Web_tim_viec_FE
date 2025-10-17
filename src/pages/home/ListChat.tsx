import { callFetchUserById } from "@/config/api";
import { useAppSelector } from "@/redux/hooks";
import { MessageOutlined, WechatFilled } from "@ant-design/icons";
import React, { useEffect, useState } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  // bổ sung thêm field khác
}
interface Company {
  id: string;
  name: string;
}
interface ConnectedUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  company?: Company;
}
const ListChat = () => {
  const [data, setData] = useState<User | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const authUser = useAppSelector((state) => state.account.user);
  const FRONTEND = import.meta.env.VITE_FRONTEND_URL;
  useEffect(() => {
    const fetchConnectedUsers = async () => {
      try {
        if (authUser?.connected?.length) {
          // Gọi API song song cho từng id trong connected
          const responses = await Promise.all(
            authUser.connected.map((id: string) => callFetchUserById(id))
          );

          // callFetchUserById trả về { data: { data: user } }
          // console.log("hihi", responses.data);
          const users = responses.map((res) => res.data);
          console.log("users:", users);
          // setConnectedUsers(users);
          setConnectedUsers(users as ConnectedUser[]);
        }
      } catch (err) {
        console.error("Fetch connected users error:", err);
      }
    };

    fetchConnectedUsers();
  }, [authUser]);

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#F9FAFB",
        minHeight: "100vh",
        // width: "100%",
      }}
    >
      <h3
        style={{
          fontSize: "20px",
          fontWeight: 600,
          marginBottom: "20px",
          color: "#333",
        }}
      >
        Danh sách các nhà tuyển dụng đã liên hệ
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(1, 1fr)", // ví dụ tối đa 2 cột, có thể đổi thành 4
          gap: "0px",
          marginTop: "40px",
          marginLeft: "150px",
        }}
      >
        {connectedUsers.map((u) => {
          const randomNum = Math.floor(Math.random() * 100);
          const hasUnread = true;
          return (
            // <a
            //   key={u._id}
            //   href={`http://localhost:3000/chat/${u._id}`} // link thẳng tới trang chat
            //   style={{
            //     textDecoration: "none",
            //   }}
            // >
            <div
              key={u._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
                height: "100px",
                width: "80%",
                position: "relative",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                backgroundColor: " #FFFFFF",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                transition: "box-shadow 0.3s",
                marginBottom: "10px",
                justifyContent: "space-between", // đẩy phần tử con ra hai đầu
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#e5e7eb",
                  overflow: "hidden",
                  flexShrink: 0,
                  left: 0,
                  marginRight: "10px",
                }}
              >
                <img
                  src={`https://avatar.iran.liara.run/public/${randomNum}.png`}
                  alt="random animal"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              {/* Info */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  // marginLeft: -50,
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: "#000000ff",
                    marginBottom: 20,
                    marginTop: 0,
                    fontSize: "14px",
                  }}
                >
                  {u.name}
                  <span
                    style={{
                      // fontSize: "0.875rem",
                      color: "#1E40AF",
                      fontSize: "14px",
                      height: "15px",
                      width: "fit-content",
                      padding: "10px 8px",
                      // marginBottom: 20,
                      backgroundColor: "#DBEAFE",
                      marginLeft: "10px",
                      borderRadius: "20px",
                      display: "inline-block",
                    }}
                  >
                    {u.company?.name}
                  </span>
                </span>

                <span
                  style={{
                    fontSize: "14px",
                    color: "#4B5563",
                    marginBottom: 0,
                  }}
                >
                  Xin chào {authUser?.name}, tôi là {u.name}, đến từ công ty{" "}
                  {u.company?.name}. Tôi đã xem qua hồ sơ của bạn và thật sự rất
                  ấn tượng với kinh nghiệm cũng như kỹ năng của bạn. Tôi muốn
                  trao đổi thêm để tìm hiểu xem liệu bạn có hứng thú với vị trí
                  đang tuyển tại công ty chúng tôi hay không.
                </span>
              </div>

              <div
                style={{
                  width: "200px",
                  height: "80px",
                  // borderRadius: "50%",
                  // backgroundColor: "#e5e7eb",
                  // overflow: "hidden",
                  // flexShrink: 0,
                  // right: 0,
                }}
              >
                <button
                  onClick={() =>
                    // (window.location.href = `http://localhost:3000/chat/${u._id}`)
                    (window.location.href = `${FRONTEND}/chat/${u._id}`)
                  }
                  style={{
                    backgroundColor: "#3b82f6", // xanh dương
                    color: "#fff",
                    width: "140px",
                    height: "40px",
                    border: "none",
                    borderRadius: "20px",
                    // padding: "8px 14px",
                    fontSize: "14px",
                    cursor: "pointer",
                    flexShrink: 0,
                    // marginLeft: "16px",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#2563eb")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "#3b82f6")
                  }
                >
                  <MessageOutlined /> Nhắn tin
                </button>
              </div>
            </div>
            // </a>
          );
        })}
      </div>
    </div>
  );
};

export default ListChat;
