import { callFetchUserById } from "@/config/api";
import { useAppSelector } from "@/redux/hooks";
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
          setConnectedUsers(users);
        }
      } catch (err) {
        console.error("Fetch connected users error:", err);
      }
    };

    fetchConnectedUsers();
  }, [authUser]);

  return (
    <div style={{ padding: "20px" }}>
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
          gridTemplateColumns: "repeat(4, 1fr)", // ví dụ tối đa 2 cột, có thể đổi thành 4
          gap: "0px",
          marginTop: "40px",
          marginLeft: "150px",
        }}
      >
        {connectedUsers.map((u) => {
          const randomNum = Math.floor(Math.random() * 100);
          const hasUnread = true;
          return (
            <a
              key={u._id}
              href={`http://localhost:3000/chat/${u._id}`} // link thẳng tới trang chat
              style={{
                textDecoration: "none",
              }}
            >
              <div
                key={u._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem",
                  height: "100px",
                  width: "200px",
                  position: "relative",
                  border: "1px solid #0f42a8ff",
                  borderRadius: "8px",
                  backgroundColor: "#476df5",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  transition: "box-shadow 0.3s",
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
                  {hasUnread && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-2px", // đẩy ra ngoài một chút để nhìn nổi hơn
                        right: "-2px",
                        width: "8px",
                        height: "8px",
                        backgroundColor: "#ff2945",
                        borderRadius: "50%",
                        border: "2px solid white",
                        zIndex: 2, // nổi lên trên lớp ảnh
                      }}
                    /> // nổi lên trên lớp ảnh
                  )}
                </div>

                {/* Info */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 600, color: "#fff" }}>
                    {u.name}
                  </span>
                  <span style={{ fontSize: "0.875rem", color: "#d1d5db" }}>
                    Công ty : {u.company?.name}
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default ListChat;
