import { Button, Col, Form, Input, Modal, Row, Select, Table, Tabs, message, notification } from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from 'antd';
import { IResume } from "@/types/backend";
import { useState, useEffect } from 'react';
import { callFetchResumeByUser, callFetchUserById, callGetSubscriberSkills, callUpdateSubscriber, callUpdateUser } from "@/config/api";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { MonitorOutlined } from "@ant-design/icons";
import { SKILLS_LIST } from "@/config/utils";
import { useAppSelector } from "@/redux/hooks";
import { ModalForm, ProFormDigit, ProFormText } from "@ant-design/pro-components";

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
}

const UserResume = (props: any) => {
    const [listCV, setListCV] = useState<IResume[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    useEffect(() => {
        const init = async () => {
            setIsFetching(true);
            const res = await callFetchResumeByUser();
            if (res && res.data) {
                setListCV(res.data as IResume[])
            }
            setIsFetching(false);
        }
        init();
    }, [])

    const columns: ColumnsType<IResume> = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1)}
                    </>)
            }
        },
        {
            title: 'Công Ty',
            dataIndex: ["companyId", "name"],

        },
        {
            title: 'Vị trí',
            dataIndex: ["jobId", "name"],

        },
        {
            title: 'Trạng thái',
            dataIndex: "status",
        },
        {
            title: 'Ngày rải CV',
            dataIndex: "createdAt",
            render(value, record, index) {
                return (
                    <>{dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
        },
        {
            title: '',
            dataIndex: "",
            render(value, record, index) {
                return (
                    <a
                        href={`${import.meta.env.VITE_BACKEND_URL}/images/resume/${record?.url}`}
                        target="_blank"
                    >Chi tiết</a>
                )
            },
        },
    ];

    return (
        <div>
            <Table<IResume>
                columns={columns}
                dataSource={listCV}
                loading={isFetching}
                pagination={false}
            />
        </div>
    )
}

const UserUpdateInfo = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const user = useAppSelector(state => state.account.user);
    const [userInfo, setUserInfo] = useState<any>(null); 
   
    console.log("hihihh: ",user);
  //  const s =  callFetchUserById(user._id);
  //  console.log("s: ",s);
  useEffect(() => {
    const fetchUser = async () => {
        if (!user._id) return;
        try {
            const res = await callFetchUserById(user._id);
            console.log("Dữ liệu từ API: ", res);
            if (res?.data) {
                form.setFieldsValue({
                    name: res.data.name || "",
                    email: res.data.email || "",
                    age: res.data.age || 0,
                    address: res.data.address || "",
                });
            }
        } catch (error) {
            console.error("Lỗi khi lấy user:", error);
        }
    };

    fetchUser();
}, [user._id]);

   

    const onFinish = async (values: any) => {
        if (!user?._id) return;

        setLoading(true);
        try {
            const userUpdate = { ...user, ...values }; // Giữ dữ liệu cũ, chỉ cập nhật trường mới
            const res = await callUpdateUser(userUpdate, user._id);
            if (res.data) {
                message.success("Cập nhật thông tin thành công");
                //reloadTable();
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res.message,
                });
            }
        } catch (error) {
            notification.error({
                message: "Có lỗi xảy ra",
                description: "Không thể cập nhật thông tin",
            });
        }
        setLoading(false);
    };

    return (
        <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
            name: user.name || "",
                email: user.email || "",
                age: user.age || 0,
                address: user.address || "",
        }}
    >
        <Form.Item
            label="Họ và tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
        >
            <Input />
        </Form.Item>

        <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ" }]}
        >
            <Input disabled />
        </Form.Item>

        <Form.Item
            label="Tuổi"
            name="age"
            rules={[{ required: true, message: "Vui lòng nhập tuổi" }]}
        >
            <Input type="number" />
        </Form.Item>
        {/* <Form.Item label="Giới tính" name="gender" rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}>
                    <Select placeholder="Chọn giới tính">
                        <Select.Option value="MALE">Nam</Select.Option>
                        <Select.Option value="FEMALE">Nữ</Select.Option>
                        <Select.Option value="OTHER">Khác</Select.Option>
                    </Select>
                </Form.Item> */}
        <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
        >
            <Input />
        </Form.Item>

        <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật
            </Button>
        </Form.Item>
    </Form>
);
};

const JobByEmail = (props: any) => {
    const [form] = Form.useForm();
    const user = useAppSelector(state => state.account.user);

    useEffect(() => {
        const init = async () => {
            const res = await callGetSubscriberSkills();
            if (res && res.data) {
                form.setFieldValue("skills", res.data.skills);
            }
        }
        init();
    }, [])

    const onFinish = async (values: any) => {
        const { skills } = values;
        const res = await callUpdateSubscriber({
            email: user.email,
            name: user.name,
            skills: skills ? skills : []
        });
        if (res.data) {
            message.success("Cập nhật thông tin thành công");
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message
            });
        }

    }

    return (
        <>
            <Form
                onFinish={onFinish}
                form={form}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <Form.Item
                            label={"Kỹ năng"}
                            name={"skills"}
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 skill!' }]}

                        >
                            <Select
                                mode="multiple"
                                allowClear
                                showArrow={false}
                                style={{ width: '100%' }}
                                placeholder={
                                    <>
                                        <MonitorOutlined /> Tìm theo kỹ năng...
                                    </>
                                }
                                optionLabelProp="label"
                                options={SKILLS_LIST}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Button onClick={() => form.submit()}>Cập nhật</Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

const ManageAccount = (props: IProps) => {
    const { open, onClose } = props;

    const onChange = (key: string) => {
        // console.log(key);
    };

    const items: TabsProps['items'] = [
        {
            key: 'user-resume',
            label: `Rải CV`,
            children: <UserResume />,
        },
        {
            key: 'email-by-skills',
            label: `Nhận Jobs qua Email`,
            children: <JobByEmail />,
        },
        {
            key: 'user-update-info',
            label: `Cập nhật thông tin`,
            children: <UserUpdateInfo />,
        },
        {
            key: 'user-password',
            label: `Thay đổi mật khẩu`,
            children: `//todo`,
        },
    ];


    return (
        <>
            <Modal
                title="Quản lý tài khoản"
                open={open}
                onCancel={() => onClose(false)}
                maskClosable={false}
                footer={null}
                destroyOnClose={true}
                width={isMobile ? "100%" : "1000px"}
            >

                <div style={{ minHeight: 400 }}>
                    <Tabs
                        defaultActiveKey="user-resume"
                        items={items}
                        onChange={onChange}
                    />
                </div>

            </Modal>
        </>
    )
}

export default ManageAccount;