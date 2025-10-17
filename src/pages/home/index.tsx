import { Divider } from "antd";
import styles from "styles/client.module.scss";
import SearchClient from "@/components/client/search.client";
import JobCard from "@/components/client/card/job.card";
import CompanyCard from "@/components/client/card/company.card";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setUserLoginInfo } from "@/redux/slice/accountSlide";
import axios from "axios";

const HomePage = () => {
  const dispatch = useDispatch();
  const BACKEND = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    const autoLogin = async () => {
      try {
        const res = await axios.get(`${BACKEND}/api/v1/auth/refresh`, {
          withCredentials: true, // Gửi cookie kèm theo request
        });

        if (res.data.access_token) {
          localStorage.setItem("access_token", res.data.access_token);
          dispatch(setUserLoginInfo(res.data.user));
        }
      } catch (error) {
        console.error("Không thể tự đăng nhập", error);
      }
    };

    autoLogin();
  }, []);
  return (
    <div className={`${styles["container"]} ${styles["home-section"]}`}>
      <div className="search-content" style={{ marginTop: 20 }}>
        <SearchClient />
      </div>
      <Divider />
      <CompanyCard />
      <div style={{ margin: 50 }}></div>
      <Divider />
      <JobCard />
    </div>
  );
};

export default HomePage;
