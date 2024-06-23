import React, { useEffect, useState } from "react";
import { Table, Input, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLoading } from "../../contexts/LoadingContext";
import "./styles.css";

const SalaryTable = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sorter, setSorter] = useState({});
  const [filters, setFilters] = useState({});
  const [searchText, setSearchText] = useState("");
  const { isLoading, setIsLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [pagination.current, sorter, filters, searchText]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      let query = `http://localhost:8000/api/salaries/?page=${pagination.current}&page_size=${pagination.pageSize}`;

      if (searchText) {
        query += `&search=${searchText}`;
      }

      if (sorter.field) {
        query += `&ordering=${sorter.order === "descend" ? "-" : ""}${sorter.field}`;
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
      title: "Employee Code",
      dataIndex: ["employee", "employee_code"],
      key: "employee_code",
      sorter: true,
      render: (text, record) => (
        <a onClick={() => navigate(`/salary/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: "Name",
      dataIndex: ["employee", "name"],
      key: "name",
      sorter: true,
    },
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      sorter: true,
    },
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
      sorter: true,
    },
    {
      title: "Total Hours",
      dataIndex: "total_hours",
      key: "total_hours",
      sorter: true,
    },
    {
      title: "Salary",
      dataIndex: "salary_amount",
      key: "salary_amount",
      sorter: true,
    },
  ];

  return (
    <>
      <Row justify="space-between" align="middle" className="search-container">
        <Col>
          <h2 className="employee-title">Employee Salaries</h2>
        </Col>
        <Col>
          <Input.Search
            placeholder="Search salaries"
            enterButton
            onSearch={handleSearch}
            className="search-input"
          />
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
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

export default SalaryTable;
