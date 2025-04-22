import { Button, Col, Form, Row, Select, Card } from 'antd';
import { EnvironmentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { convertSlug, LOCATION_LIST, SKILLS_LIST } from '@/config/utils';
import { ProForm } from '@ant-design/pro-components';
import axios from 'axios';
import { useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import styles from 'styles/client.module.scss';// CSS module cho styling
import { callSearchJobByLocationAndSkills } from '@/config/api';
import { IJob } from '@/types/backend';
import { useNavigate } from 'react-router-dom';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const SearchClient = () => {
    const optionsSkills = SKILLS_LIST;
    const optionsLocations = LOCATION_LIST;
    const [form] = Form.useForm();
    const [displayJob, setDisplayJob] = useState<IJob[]>([]);  // Lưu danh sách công việc
    const [loading, setLoading] = useState(false); // Trạng thái tải dữ liệu
    const navigate = useNavigate();
    const [hasSearched, setHasSearched] = useState(false);
    
    const onFinish = async (values: any) => {
        setLoading(true); // Bắt đầu tải
       
        setHasSearched(true); // Đánh dấu là đã tìm kiếm
        try {
            const res = await callSearchJobByLocationAndSkills(values.skills, values.location);
            if (res?.data) {
                setDisplayJob(res.data);
            } else {
                setDisplayJob([]);
            }
        } catch (error) {
            console.error('Error searching jobs:', error);
        } finally {
            setLoading(false);
        }
        try {
            const res = await callSearchJobByLocationAndSkills( values.skills,values.location);
            if (res?.data) {
                setDisplayJob(res.data); // Lưu kết quả vào displayJob nếu có data
            } else {
                setDisplayJob([]); // Nếu không có data, set displayJob là mảng rỗng
            }
        } catch (error) {
            console.error('Error searching jobs:', error);
        } finally {
            setLoading(false); // Kết thúc tải
        }
    };
 const handleViewDetailJob = (item: IJob) => {
        const slug = convertSlug(item.name);
        navigate(`/job/${slug}?id=${item._id}`)
    }
    // const handleViewDetailJob = (job: any) => {
    //     console.log("Viewing details for job:", job);
    //     // Bạn có thể thêm logic chuyển hướng hoặc mở modal hiển thị chi tiết công việc.
    // };

    const getLocationName = (locationId: string) => {
        const location = LOCATION_LIST.find((loc: any) => loc.value === locationId);
        return location ? location.label : "Không rõ địa điểm";
    };

    return (
        <>
            {/* Form tìm kiếm */}
            <ProForm
                form={form}
                onFinish={onFinish}
                submitter={{
                    render: () => <></>,
                }}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24}><h2>Việc Làm IT Cho Developer "Chất"</h2></Col>
                    <Col span={24} md={16}>
                        <ProForm.Item name="skills">
                            <Select
                                mode="multiple"
                                allowClear
                                showArrow={false}
                                style={{ width: '100%' }}
                                placeholder="Tìm theo kỹ năng..."
                                optionLabelProp="label"
                                options={optionsSkills}
                            />
                        </ProForm.Item>
                    </Col>
                    <Col span={12} md={4}>
                        <ProForm.Item name="location">
                            <Select
                                mode="multiple"
                                allowClear
                                showArrow={false}
                                style={{ width: '100%' }}
                                placeholder="Địa điểm..."
                                optionLabelProp="label"
                                options={optionsLocations}
                            />
                        </ProForm.Item>
                    </Col>
                    <Col span={12} md={4}>
                        <Button type="primary" onClick={() => form.submit()} loading={loading}>
                            Search
                        </Button>
                    </Col>
                </Row>
            </ProForm>

            {/* Danh sách công việc */}
            {hasSearched && (
            <Row gutter={[20, 20]} style={{ marginTop: '20px' }}>
                {displayJob.length > 0 ? (
                    displayJob.map((item: any) => (
                        <Col span={24} md={12} key={item._id}>
                            <Card
                                size="small"
                                title={null}
                                hoverable
                                onClick={() => handleViewDetailJob(item)}
                            >
                                <div className={styles["card-job-content"]}>
                                    <div className={styles["card-job-left"]}>
                                        <img
                                            alt="Company Logo"
                                            src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${item?.company?.logo}`}
                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className={styles["card-job-right"]}>
                                        <div className={styles["job-title"]}>{item.name}</div>
                                        <div className={styles["job-location"]}>
                                            <EnvironmentOutlined style={{ color: '#58aaab' }} />&nbsp;
                                            {getLocationName(item.location)}
                                        </div>
                                        <div>
                                            <ThunderboltOutlined style={{ color: 'orange' }} />&nbsp;
                                            {item.salary?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ
                                        </div>
                                        <div className={styles["job-updatedAt"]}>
                                            {dayjs(item.updatedAt).fromNow()}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))
                ) : (
                    !loading && <Col span={24}><p>Không tìm thấy công việc nào phù hợp.</p></Col>
                )}
            </Row>
            )}
        </>
    );
};

export default SearchClient;
