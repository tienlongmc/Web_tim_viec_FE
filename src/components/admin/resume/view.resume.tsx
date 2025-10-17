import { callUpdateResumeStatus, callUpdateUserConnected } from "@/config/api";
import { IResume } from "@/types/backend";
import {
  Badge,
  Button,
  Descriptions,
  Drawer,
  Form,
  Select,
  message,
  notification,
  Space,
  List,
  Input,
  Divider,
} from "antd";
import { MessageOutlined, SendOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAppSelector } from "@/redux/hooks";
const { Option } = Select;
const { TextArea } = Input;

interface IProps {
  onClose: (v: boolean) => void;
  open: boolean;
  dataInit: IResume | null | any;
  setDataInit: (v: any) => void;
  reloadTable: () => void;
}

type ChatMsg = {
  id: string;
  from: "me" | "candidate";
  text: string;
  at: string; // ISO string
};

const ViewDetailResume = (props: IProps) => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const { onClose, open, dataInit, setDataInit, reloadTable } = props;
  const [form] = Form.useForm();
  const BACKEND = import.meta.env.VITE_BACKEND_URL;
  const FRONTEND = import.meta.env.VITE_FRONTEND_URL;
  // --- Chat states ---
  const [openChat, setOpenChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const authUser = useAppSelector((state) => state.account.user);

  // Khởi tạo hội thoại mẫu (bạn thay bằng fetch API thật khi openChat = true)
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  useEffect(() => {
    if (openChat) {
      // Fake data demo lần đầu mở
      setMessages((prev) =>
        prev.length
          ? prev
          : [
              {
                id: "1",
                from: "candidate",
                text: "Chào anh/chị, em đã nộp CV ạ.",
                at: dayjs().subtract(2, "hour").toISOString(),
              },
              {
                id: "2",
                from: "me",
                text: "Cảm ơn em, bên mình sẽ review sớm nhé!",
                at: dayjs().subtract(1, "hour").toISOString(),
              },
            ]
      );
      // Auto scroll cuối danh sách
      setTimeout(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [openChat]);

  const candidateName = useMemo(() => {
    return dataInit?.email || dataInit?.candidateName || "Ứng viên";
  }, [dataInit]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    try {
      // TODO: gọi API gửi tin với payload phù hợp:
      // await callSendMessage({ resumeId: dataInit?._id, text })
      const newMsg: ChatMsg = {
        id: `${Date.now()}`,
        from: "me",
        text,
        at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
      setDraft("");
      // Auto scroll xuống cuối
      setTimeout(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
    } catch (e: any) {
      notification.error({
        message: "Gửi tin nhắn thất bại",
        description: e?.message || "Vui lòng thử lại",
      });
    } finally {
      setSending(false);
    }
  };

  const handleChangeStatus = async () => {
    setIsSubmit(true);
    const status = form.getFieldValue("status");
    const res = await callUpdateResumeStatus(dataInit?._id, status);
    if (res.data) {
      message.success("Update Resume status thành công!");
      setDataInit(null);
      onClose(false);
      reloadTable();
    } else {
      notification.error({
        message: "Có lỗi xảy ra",
        description: res.message,
      });
    }
    setIsSubmit(false);
  };

  useEffect(() => {
    if (dataInit) {
      form.setFieldValue("status", dataInit.status);
    }
    return () => form.resetFields();
  }, [dataInit]);
  const handleChatClick = async () => {
    try {
      await callUpdateUserConnected(authUser._id, [dataInit?.userId]);

      // mở cửa sổ chat sau khi update
      // window.open(`http://localhost:3000/chat/${dataInit?.userId}`, "_blank");
    } catch (err) {
      console.error("Update connected error:", err);
    }
  };
  console.log("dataInit", dataInit);
  return (
    <>
      <Drawer
        title="Thông Tin Resume"
        placement="right"
        onClose={() => {
          onClose(false);
          setDataInit(null);
        }}
        open={open}
        width={"40vw"}
        maskClosable={false}
        destroyOnClose
        extra={
          <Space>
            <Button
              type="link"
              href={`${FRONTEND}/chat/${dataInit?.userId}`}
              // href={`http://localhost:3000/chat/${dataInit?.userId}`}
              target="_blank"
              style={{ width: "100%" }}
              onClick={handleChatClick}
            >
              Nhắn tin
            </Button>
            <Button
              loading={isSubmit}
              type="primary"
              onClick={handleChangeStatus}
            >
              Change Status
            </Button>
          </Space>
        }
      >
        <Descriptions title="" bordered column={2} layout="vertical">
          <Descriptions.Item label="Email">{dataInit?.email}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Form form={form}>
              <Form.Item name={"status"} style={{ marginBottom: 0 }}>
                <Select
                  style={{ width: "100%" }}
                  defaultValue={dataInit?.status}
                >
                  <Option value="PENDING">PENDING</Option>
                  <Option value="REVIEWING">REVIEWING</Option>
                  <Option value="APPROVED">APPROVED</Option>
                  <Option value="REJECTED">REJECTED</Option>
                </Select>
              </Form.Item>
            </Form>
          </Descriptions.Item>

          <Descriptions.Item label="Tên Job">
            {dataInit?.jobId?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Tên Công Ty">
            {dataInit?.companyId?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {dataInit && dataInit.createdAt
              ? dayjs(dataInit.createdAt).format("DD-MM-YYYY HH:mm:ss")
              : ""}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sửa">
            {dataInit && dataInit.updatedAt
              ? dayjs(dataInit.updatedAt).format("DD-MM-YYYY HH:mm:ss")
              : ""}
          </Descriptions.Item>

          <Descriptions.Item label="CV" span={1}>
            {dataInit?.url ? (
              <Button
                type="link"
                href={`${BACKEND}/images/resume/${dataInit.url}`}
                target="_blank"
                style={{ width: "100%" }}
              >
                Xem CV
              </Button>
            ) : (
              "Chưa có CV"
            )}
          </Descriptions.Item>
        </Descriptions>
      </Drawer>

      {/* Drawer Chat */}
      <Drawer
        title={`Nhắn tin với ${candidateName}`}
        placement="right"
        onClose={() => setOpenChat(false)}
        open={openChat}
        width={420}
        destroyOnClose
      >
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <div
            ref={listRef}
            style={{
              flex: 1,
              overflowY: "auto",
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <List
              dataSource={messages}
              renderItem={(item) => {
                const mine = item.from === "me";
                return (
                  <List.Item style={{ border: "none", padding: "6px 0" }}>
                    <div
                      style={{
                        maxWidth: "80%",
                        marginLeft: mine ? "auto" : 0,
                        background: mine ? "#1677ff22" : "#f5f5f5",
                        border: `1px solid ${mine ? "#1677ff55" : "#eee"}`,
                        borderRadius: 8,
                        padding: "8px 10px",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      <div
                        style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}
                      >
                        {mine ? "Bạn" : candidateName} •{" "}
                        {dayjs(item.at).format("HH:mm DD/MM")}
                      </div>
                      <div>{item.text}</div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </div>

          <Divider style={{ margin: "10px 0" }} />

          <div style={{ display: "flex", gap: 8 }}>
            <TextArea
              placeholder="Nhập tin nhắn..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={sending}
              onClick={handleSend}
              disabled={!draft.trim()}
            />
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default ViewDetailResume;
