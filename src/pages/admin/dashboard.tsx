import ChatLoader from "@/components/ChatLoader";
import { callFetchManagementStats } from "@/config/api";
import { useAppSelector } from "@/redux/hooks";
import { Card, Col, Row, Statistic } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import CountUp from "react-countup";

const DashboardPage = () => {
  //   const formatter = (value: number | string) => {
  //     return <CountUp end={Number(value)} separator="," />;
  //   };
  const authUser = useAppSelector((state) => state.account.user);
  //   const cards = [
  //     { title: "Card 1", label: "Active Users", value: 112893 },
  //     { title: "Card 2", label: "Orders", value: 5200 },
  //     { title: "Card 3", label: "Revenue", value: 345000 },
  //     { title: "Card 4", label: "New Customers", value: 129 },
  //   ];

  //   // Nếu user là admin thì show 4 card, không thì chỉ show 2
  //   const visibleCards =
  //     authUser?.role.name === "SUPER_ADMIN" ? cards : cards.slice(0, 2);
  const [stats, setStats] = useState<any>(null);

  const formatter = (value: number | string) => {
    return <CountUp end={Number(value)} separator="," />;
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await callFetchManagementStats();
        setStats(res.data); // { totalUsers, totalCompanies, totalJobs, totalResumes }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    if (authUser) {
      fetchStats();
    }
  }, [authUser]);

  // Nếu chưa có data thì return null hoặc loading
  if (!stats) return <ChatLoader></ChatLoader>;

  const cards = [
    { title: "Users", label: "Total Users", value: stats.totalUsers },
    {
      title: "Companies",
      label: "Total Companies",
      value: stats.totalCompanies,
    },
    { title: "Jobs", label: "Total Jobs", value: stats.totalJobs },
    { title: "Resumes", label: "Total Resumes", value: stats.totalResumes },
  ];

  // Check role
  const role = authUser?.role?.name; // ví dụ SUPER_ADMIN
  const visibleCards = role === "SUPER_ADMIN" ? cards : cards.slice(0, 2);

  return (
    <Row gutter={[20, 20]}>
      {visibleCards.map((card, index) => (
        <Col key={index} span={24} md={8}>
          <Card title={card.title} bordered={false}>
            <Statistic
              title={card.label}
              value={card.value}
              formatter={formatter}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DashboardPage;
