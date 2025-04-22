import { Button, Divider, Form, Input, message, notification } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { callgoogle, callgoogle1, callLogin } from 'config/api';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserLoginInfo } from '@/redux/slice/accountSlide';
import styles from 'styles/auth.module.scss';
import { useAppSelector } from '@/redux/hooks';

const LoginPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);
    const dispatch = useDispatch();
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const callback = params?.get("callback");

    useEffect(() => {
        //đã login => redirect to '/'
        if (isAuthenticated) {
            // navigate('/');
            window.location.href = '/';
        }
    }, [])

    const onFinish = async (values: any) => {
        const { username, password } = values;
        setIsSubmit(true);
        const res = await callLogin(username, password);
        setIsSubmit(false);
        if (res?.data) {
            localStorage.setItem('access_token', res.data.access_token);
            dispatch(setUserLoginInfo(res.data.user))
            message.success('Đăng nhập tài khoản thành công!');
            window.location.href = callback ? callback : '/';
        } else {
            notification.error({
                message: "Có lỗi xảy ra",
                description:
                    res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 5
            })
        }
    };
    // const handleGoogleLogin = async () => {
    //     try {
    //         const res = await callgoogle1(); // Nếu cần gọi API trước khi điều hướng
    //         if (res?.success) {
    //             window.location.href = 'http://localhost:3000/auth/google';
    //         } else {
    //             notification.error({
    //                 message: "Lỗi khi đăng nhập Google",
    //                 description: res.message || "Không thể đăng nhập với Google.",
    //                 duration: 5
    //             });
    //         }
    //     } catch (error) {
    //         notification.error({
    //             message: "Lỗi kết nối",
    //             description: "Vui lòng thử lại sau.",
    //             duration: 5
    //         });
    //     }
    // };
    

    return (
        <div className={styles["login-page"]}>
            <main className={styles.main}>
                <div className={styles.container}>
                    <section className={styles.wrapper}>
                        <div className={styles.heading}>
                            <h2 className={`${styles.text} ${styles["text-large"]}`}>Đăng Nhập</h2>
                            <Divider />

                        </div>
                        <Form
                            name="basic"
                            // style={{ maxWidth: 600, margin: '0 auto' }}
                            onFinish={onFinish}
                            autoComplete="off"
                        >
                            <Form.Item
                                labelCol={{ span: 24 }} //whole column
                                label="Email"
                                name="username"
                                rules={[{ required: true, message: 'Email không được để trống!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }} //whole column
                                label="Mật khẩu"
                                name="password"
                                rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                            // wrapperCol={{ offset: 6, span: 16 }}
                            >
                                 <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <Button type="primary" htmlType="submit" loading={isSubmit}>
                                    Đăng nhập
                                </Button>
                                <Button  style={{
                                backgroundColor: 'white', // Màu đỏ đặc trưng của Google
                                color: 'black',
                                border: '1px solid #d5dbdb',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '15px 15px',
                                
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d5dbdb'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                type="default"  onClick={() =>callgoogle1()}>
                                     <img 
                                    src="https://logos-world.net/wp-content/uploads/2020/09/Google-Symbol.png" 
                                    alt="Google Logo" 
                                    style={{ width: 30, height: 18, marginRight: 8 }} 
                                />
                                Đăng nhập với Google
                                </Button>
                            </div>
                            </Form.Item>
                            <Divider>Or</Divider>
                            <p className="text text-normal">Chưa có tài khoản ?
                                <span>
                                    <Link to='/register' > Đăng Ký </Link>
                                </span>
                                <span>OR </span>
                                <span>
                                <Link to="#" onClick={() => callgoogle()}>Đăng Ký Nhanh Với tài khoản Google</Link>
                            </span>

                            </p>
                        </Form>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default LoginPage;