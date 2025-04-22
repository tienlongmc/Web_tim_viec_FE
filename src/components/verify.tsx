

import React from 'react';
import { Button, Col, Divider, Form, Input, message, notification, Row } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { checkcode } from '@/config/api';
// import { sendRequest } from '@/utils/api';

const Verify = (props:any) => {
     const {id} = props;
    const navigate = useNavigate();

    const onFinish = async (values:any) => {
        const { _id, code } = values;
        const response = await fetch("http://localhost:8000/api/v1/auth/check-code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ _id, code })
        });
        const res = await response.json();
        //const id = 1;
        if (res?.data) {
            message.success("Kích hoạt tài khoản thành công.");
            navigate('/login');
        } else {
            notification.error({
                message: "Verify error",
                description: res?.message
            });
        }
    };

    return (
        <Row justify="center" style={{ marginTop: "30px" }}>
            <Col xs={24} md={16} lg={8}>
                <fieldset style={{ padding: "15px", margin: "5px", border: "1px solid #ccc", borderRadius: "5px" }}>
                    <legend>Kích hoạt tài khoản</legend>
                    <Form name="basic" onFinish={onFinish} autoComplete="off" layout="vertical">
                        <Form.Item label="Id" name="_id" initialValue={id} hidden>
                            <Input disabled />
                        </Form.Item>
                        <div>Mã code đã được gửi tới email đăng ký, vui lòng kiểm tra email.</div>
                        <Divider />
                        <Form.Item
                            label="Code"
                            name="code"
                            rules={[{ required: true, message: 'Please input your code!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">Submit</Button>
                        </Form.Item>
                    </Form>
                    <Button type="link" onClick={() => navigate('/')}> 
                        <ArrowLeftOutlined /> Quay lại trang chủ
                    </Button>
                    <Divider />
                    <div style={{ textAlign: "center" }}>
                        Đã có tài khoản? <Button type="link" onClick={() => navigate('/auth/login')}>Đăng nhập</Button>
                    </div>
                </fieldset>
            </Col>
        </Row>
    );
};

export default Verify;
