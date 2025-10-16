import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IJob } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  ProColumns,
  ProFormSelect,
} from "@ant-design/pro-components";
import {
  Button,
  Popconfirm,
  Select,
  Space,
  Tag,
  message,
  notification,
} from "antd";
import { useState, useRef } from "react";
import dayjs from "dayjs";
import { callDeleteJob } from "@/config/api";
import queryString from "query-string";
import { useNavigate } from "react-router-dom";
import { fetchJob } from "@/redux/slice/jobSlide";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";

const JobPage = () => {
  const tableRef = useRef<ActionType>();

  const isFetching = useAppSelector((state) => state.job.isFetching);
  const meta = useAppSelector((state) => state.job.meta);
  const jobs = useAppSelector((state) => state.job.result);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.account.user);
  // console.log("adjad",user)
  let companyId: any = null; // Lấy companyId từ user
  const userRole = user.role.name;
  if (userRole === "HR") {
    companyId = user?.company._id;
  }
  console.log("hiih: ", companyId);
  // console.log("user: ",user);
  const handleDeleteJob = async (_id: string | undefined) => {
    if (_id) {
      const res = await callDeleteJob(_id);
      if (res && res.data) {
        message.success("Xóa Job thành công");
        reloadTable();
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.message,
        });
      }
    }
  };

  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  const columns: ProColumns<IJob>[] = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (text, record, index) => {
        return <>{index + 1 + (meta.current - 1) * meta.pageSize}</>;
      },
      hideInSearch: true,
    },
    {
      title: "Tên Job",
      dataIndex: "name",
      sorter: true,
    },
    {
      title: "Mức lương",
      dataIndex: "salary",
      sorter: true,
      render(dom, entity, index, action, schema) {
        const str = "" + entity.salary;
        return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} đ</>;
      },
    },
    {
      title: "Level",
      dataIndex: "level",
      renderFormItem: (item, props, form) => (
        <ProFormSelect
          showSearch={true}
          mode="multiple"
          allowClear={true}
          valueEnum={{
            INTERN: "Intern",
            FRESHER: "Fresher",
            JUNIOR: "Junior",
            MIDDLE: "Middle",
            SENIOR: "Senior",
          }}
          placeholder="Chọn cấp bậc"
          fieldProps={{
            filterOption: false,
          }}
        />
      ),
    },
    {
      title: "Tên Công Ty",
      dataIndex: ["company", "name"], // Truy cập tên công ty từ `company.name`
      key: "company",
      sorter: true, // Nếu muốn sắp xếp theo tên công ty
    },

    {
      title: "Trạng thái",
      dataIndex: "isActive",
      render(dom, entity, index, action, schema) {
        return (
          <>
            <Tag color={entity.isActive ? "lime" : "red"}>
              {entity.isActive ? "ACTIVE" : "INACTIVE"}
            </Tag>
          </>
        );
      },
      hideInSearch: true,
    },

    {
      title: "CreatedAt",
      dataIndex: "createdAt",
      width: 200,
      sorter: true,
      render: (text, record, index, action) => {
        return <>{dayjs(record.createdAt).format("DD-MM-YYYY HH:mm:ss")}</>;
      },
      hideInSearch: true,
    },
    {
      title: "UpdatedAt",
      dataIndex: "updatedAt",
      width: 200,
      sorter: true,
      render: (text, record, index, action) => {
        return <>{dayjs(record.updatedAt).format("DD-MM-YYYY HH:mm:ss")}</>;
      },
      hideInSearch: true,
    },
    {
      title: "Actions",
      hideInSearch: true,
      width: 50,
      render: (_value, entity, _index, _action) => (
        <Space>
          <Access permission={ALL_PERMISSIONS.JOBS.UPDATE} hideChildren>
            <EditOutlined
              style={{
                fontSize: 20,
                color: "#ffa500",
              }}
              type=""
              onClick={() => {
                navigate(`/admin/job/upsert?id=${entity._id}`);
              }}
            />
          </Access>
          <Access permission={ALL_PERMISSIONS.JOBS.DELETE} hideChildren>
            <Popconfirm
              placement="leftTop"
              title={"Xác nhận xóa job"}
              description={"Bạn có chắc chắn muốn xóa job này ?"}
              onConfirm={() => handleDeleteJob(entity._id)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <span style={{ cursor: "pointer", margin: "0 10px" }}>
                <DeleteOutlined
                  style={{
                    fontSize: 20,
                    color: "#ff4d4f",
                  }}
                />
              </span>
            </Popconfirm>
          </Access>
        </Space>
      ),
    },
  ];

  const buildQuery = (params: any, sort: any, filter: any) => {
    const clone = { ...params };
    if (clone.name) clone.name = `/${clone.name}/i`;
    if (clone.salary) clone.salary = `/${clone.salary}/i`;
    if (clone?.level?.length) {
      clone.level = clone.level.join(",");
    }

    let temp = queryString.stringify(clone);

    let sortBy = "";
    if (sort && sort.name) {
      sortBy = sort.name === "ascend" ? "sort=name" : "sort=-name";
    }
    if (sort && sort.salary) {
      sortBy = sort.salary === "ascend" ? "sort=salary" : "sort=-salary";
    }
    if (sort && sort.createdAt) {
      sortBy =
        sort.createdAt === "ascend" ? "sort=createdAt" : "sort=-createdAt";
    }
    if (sort && sort.updatedAt) {
      sortBy =
        sort.updatedAt === "ascend" ? "sort=updatedAt" : "sort=-updatedAt";
    }

    //mặc định sort theo updatedAt
    if (Object.keys(sortBy).length === 0) {
      temp = `${temp}&sort=-updatedAt`;
    } else {
      temp = `${temp}&${sortBy}`;
    }

    return temp;
  };

  return (
    <div>
      <Access permission={ALL_PERMISSIONS.JOBS.GET_PAGINATE}>
        <DataTable<IJob>
          actionRef={tableRef}
          headerTitle="Danh sách Jobs"
          rowKey="_id"
          loading={isFetching}
          columns={columns}
          dataSource={jobs}
          request={async (params, sort, filter): Promise<any> => {
            let queryParams = { ...params };
            if (userRole == "HR") {
              queryParams["company._id"] = companyId;
            }
            // console.log("Query Params:", queryParams);
            const query = buildQuery(queryParams, sort, filter);
            dispatch(fetchJob({ query })).then((result) => {
              console.log("🔹 Danh sách công việc sau khi fetch:", result);
            });
          }}
          scroll={{ x: true }}
          pagination={{
            current: meta.current,
            pageSize: meta.pageSize,
            showSizeChanger: true,
            total: meta.total,
            showTotal: (total, range) => {
              return (
                <div>
                  {" "}
                  {range[0]}-{range[1]} trên {total} rows
                </div>
              );
            },
          }}
          rowSelection={false}
          toolBarRender={(_action, _rows): any => {
            return (
              <Button
                icon={<PlusOutlined />}
                type="primary"
                onClick={() => navigate("upsert")}
              >
                Thêm mới
              </Button>
            );
          }}
        />
      </Access>
    </div>
  );
};

export default JobPage;
