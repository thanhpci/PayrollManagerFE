import React, { useEffect, useState } from "react";
import { Table, Tag, Input, Button, Space } from "antd";
import { Row, Col } from "antd";

import axios from "axios";
import { useLoading } from "../../contexts/LoadingContext";
import { SearchOutlined } from "@ant-design/icons";

const EmployeeTable = () => {
  const [data, setData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sorter, setSorter] = useState({});
  const [filters, setFilters] = useState({});
  const [searchText, setSearchText] = useState("");
  const { isLoading, setIsLoading } = useLoading();

  useEffect(() => {
    fetchData();
    fetchDepartments();
  }, [pagination.current, sorter, filters, searchText]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      let query = `http://localhost:8000/api/employees/?page=${pagination.current}&page_size=${pagination.pageSize}`;

      if (searchText) {
        query += `&search=${searchText}`;
      }

      if (sorter.field) {
        query += `&ordering=${sorter.order === "descend" ? "-" : ""}${
          sorter.field
        }`;
      }

      for (const key in filters) {
        if (filters[key]) {
          query += `&${key}=${filters[key]}`;
        }
      }

      const response = await axios.get(query);
      setData(response.data.results);
      setPagination((prevPagination) => ({
        ...prevPagination,
        total: response.data.count,
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "http://localhost:8000/api/departments/all/"
      );
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      current: pagination.current,
      pageSize: pagination.pageSize,
    }));
    setSorter(sorter);
    setFilters(filters);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination((prevPagination) => ({
      ...prevPagination,
      current: 1, // Reset to the first page
    }));
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "employee_code",
      key: "employee_code",
      sorter: true,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Phone",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "Date of Birth",
      dataIndex: "date_of_birth",
      key: "date_of_birth",
      sorter: true,
    },
    {
      title: "Department",
      dataIndex: "departments",
      key: "departments",
      filters: departments.map((department) => ({
        text: department.name,
        value: department.name,
      })),
      onFilter: (value, record) =>
        record.departments.some((dep) => dep.name === value),
      render: (departments) =>
        departments.map((department) => (
          <Tag color="blue" key={department.id}>
            {department.name}
          </Tag>
        )),
    },
  ];

  return (
    <>
      {/* <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search employees"
          enterButton
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </Space> */}

      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2>Employee List</h2>
        </Col>
        <Col>
          <Input.Search
            placeholder="Search employees"
            enterButton
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="employee_code"
        pagination={{
          ...pagination,
          showTotal: (total) => `Total ${total} items`,
        }}
        loading={isLoading}
        onChange={handleTableChange}
      />
    </>
  );
};

export default EmployeeTable;
