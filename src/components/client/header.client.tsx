import { useState, useEffect } from "react";
import {
  CodeOutlined,
  ContactsOutlined,
  DashOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  RiseOutlined,
  TwitterOutlined,
  WechatFilled,
} from "@ant-design/icons";
import {
  Avatar,
  Drawer,
  Dropdown,
  Flex,
  MenuProps,
  Space,
  message,
} from "antd";
import { Menu, ConfigProvider } from "antd";
import styles from "@/styles/client.module.scss";
import { isMobile } from "react-device-detect";
import { FaReact } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { callLogout } from "@/config/api";
import { setLogoutAction, setUserLoginInfo } from "@/redux/slice/accountSlide";
import ManageAccount from "./modal/manage.account";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const Header = (props: any) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(
    (state) => state.account.isAuthenticated
  );
  const user = useAppSelector((state) => state.account.user);
  const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);
  // console.log("ussername header: ", user);
  const [current, setCurrent] = useState("home");
  const location = useLocation();
  const [avatar, setAvatar] = useState<string | null>(null);

  const [openMangeAccount, setOpenManageAccount] = useState<boolean>(false);
  // useEffect(()=>{
  //     const urlParams  = new URLSearchParams(window.location.search);
  //     const token = urlParams.get("token");
  //     if(token){
  //     localStorage.setItem("jwtToken",token);
  //     window.location.href = "http://localhost:3000";
  //     }
  // },[]);
  // useEffect(() => {
  //     setCurrent(location.pathname);
  // }, [location])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      // Lưu token vào localStorage hoặc cookie
      // localStorage.setItem("token", token);
      localStorage.setItem("access_token", token);
      Cookies.set("refresh_token", token, { expires: 5 / 1440 });

      // Gửi token lên server để lấy thông tin user
      fetchUser(token);

      // Xóa token khỏi URL để tránh bị lộ
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  let avt = "";
  const fetchUser = (token: string) => {
    try {
      // console.log("User info từ JWT1:");
      const decoded: any = jwtDecode(token); // Giải mã token
      // console.log("User info từ JWT2:");
      if (!decoded) throw new Error("Không giải mã được token!");

      console.log("User info từ JWT3:", decoded);
      setAvatar(decoded.avatar);
      // Cập nhật Redux hoặc state với thông tin user từ token
      dispatch(setUserLoginInfo(decoded));
    } catch (error) {
      console.error("Lỗi khi giải mã token:", error);
    }
  };

  const items: MenuProps["items"] = [
    {
      label: <Link to={"/"}>Trang Chủ</Link>,
      key: "/",
      icon: <TwitterOutlined />,
    },
    {
      label: <Link to={"/job"}>Việc Làm IT</Link>,
      key: "/job",
      icon: <CodeOutlined />,
    },
    {
      label: <Link to={"/company"}>Top Công ty IT</Link>,
      key: "/company",
      icon: <RiseOutlined />,
    },
    {
      label: <Link to={"/listchat"}>Nhắn tin</Link>,
      key: "/listchat",
      icon: <WechatFilled />,
    },
  ];

  const onClick: MenuProps["onClick"] = (e) => {
    setCurrent(e.key);
  };

  const handleLogout = async () => {
    const res = await callLogout();
    if (res && res.data) {
      dispatch(setLogoutAction({}));
      message.success("Đăng xuất thành công");
      navigate("/");
    }
  };

  const itemsDropdown = [
    {
      label: (
        <label
          style={{ cursor: "pointer" }}
          onClick={() => setOpenManageAccount(true)}
        >
          Quản lý tài khoản
        </label>
      ),
      key: "manage-account",
      icon: <ContactsOutlined />,
    },
    {
      label: <Link to={"/admin"}>Trang Quản Trị</Link>,
      key: "admin",
      icon: <DashOutlined />,
    },
    {
      label: (
        <label style={{ cursor: "pointer" }} onClick={() => handleLogout()}>
          Đăng xuất
        </label>
      ),
      key: "logout",
      icon: <LogoutOutlined />,
    },
  ];

  const itemsMobiles = [...items, ...itemsDropdown];

  return (
    <>
      <div className={styles["header-section"]}>
        <div className={styles["container"]}>
          {!isMobile ? (
            <div style={{ display: "flex", gap: 30 }}>
              <div className={styles["brand"]}>
                <FaReact onClick={() => navigate("/")} title="Tiến Long" />
              </div>
              <div className={styles["top-menu"]}>
                <ConfigProvider
                  theme={{
                    token: {
                      colorPrimary: "#fff",
                      colorBgContainer: "#222831",
                      colorText: "#a7a7a7",
                    },
                  }}
                >
                  <Menu
                    // onClick={onClick}
                    selectedKeys={[current]}
                    mode="horizontal"
                    items={items}
                  />
                </ConfigProvider>
                <div className={styles["extra"]}>
                  {isAuthenticated === false ? (
                    <Link to={"/login"}>Đăng Nhập</Link>
                  ) : (
                    <Dropdown
                      menu={{ items: itemsDropdown }}
                      trigger={["click"]}
                    >
                      <Space style={{ cursor: "pointer" }}>
                        <span>Welcome {user?.name}</span>
                        <Avatar>
                          {/* <img src={user.avatar} alt="Avatar" /> */}
                          {/* {user?.name?.substring(0, 2)?.toUpperCase()}  */}
                          {/* {user.avatar} */}
                          {avatar ? (
                            <img
                              src={avatar}
                              style={{
                                width: "26px",
                                height: "27px",
                                borderRadius: "50%",
                              }}
                              alt="Avatar"
                            />
                          ) : (
                            user?.name?.substring(0, 2)?.toUpperCase()
                          )}
                        </Avatar>
                      </Space>
                    </Dropdown>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles["header-mobile"]}>
              <span>Your APP</span>
              <MenuFoldOutlined onClick={() => setOpenMobileMenu(true)} />
            </div>
          )}
        </div>
      </div>
      <Drawer
        title="Chức năng"
        placement="right"
        onClose={() => setOpenMobileMenu(false)}
        open={openMobileMenu}
      >
        <Menu
          onClick={onClick}
          selectedKeys={[current]}
          mode="vertical"
          items={itemsMobiles}
        />
      </Drawer>
      <ManageAccount open={openMangeAccount} onClose={setOpenManageAccount} />
    </>
  );
};

export default Header;
