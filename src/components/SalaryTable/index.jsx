import React, { useEffect, useState } from "react";
import { Table, Input, Row, Col, Drawer, Button, Form, Select } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLoading } from "../../contexts/LoadingContext";
import "./styles.css";
import iconFilter from "../../assets/icon_filter.svg"; // Đường dẫn đến file SVG
import { Tooltip } from "antd";

const { Option } = Select;

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
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [filterForm] = Form.useForm();
  const { isLoading, setIsLoading } = useLoading();
  const navigate = useNavigate();

  const [months, setMonths] = useState([]);
  const [years, setYears] = useState([]);

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
      const salaryData = response.data.results;

      for (let record of salaryData) {
        if (record.salary_amount === null) {
          const errorsResponse = await calculateSalary(
            record.employee.employee_code,
            record.month,
            record.year
          );
          record.salary_amount = errorsResponse.errors.map((error) => (
            <div className="salary-error" key={error.date}>
              {error.errors.map((e, index) => (
                <div key={index} className="salary-error-message">
                  {`${error.date}\t${e.message}`}
                </div>
              ))}
            </div>
          ));
        }
      }

      setData(salaryData);
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

  useEffect(() => {
    fetchMonths();
    fetchYears();
  }, []);

  const fetchMonths = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/salary/available-months/"
      );
      setMonths(response.data.months);
    } catch (error) {
      console.error("Error fetching months:", error);
    }
  };

  const fetchYears = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/salary/available-years/"
      );
      setYears(response.data.years);
    } catch (error) {
      console.error("Error fetching years:", error);
    }
  };

  const calculateSalary = async (employee_code, month, year) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/calculate-salary/",
        {
          employee_code,
          month,
          year,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      return error.response.data;
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

  const handleFilter = (values) => {
    setFilters(values);
    setPagination((prevPagination) => ({
      ...prevPagination,
      current: 1,
    }));
    setFilterDrawerVisible(false);
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
      title: "Salary",
      dataIndex: "salary_amount",
      key: "salary_amount",
      sorter: true,
      render: (text) => (
        <div className="salary-column">{text === null ? "N/A" : text}</div>
      ),
    },
  ];

  return (
    <>
      <Row justify="space-between" align="middle" className="search-container">
        <Col>
          <h2 className="employee-title">Employee Salaries</h2>
        </Col>
        <Col>
          <Row>
            <Tooltip title="Filter">
              <div className="filter-icon-container">
                <img
                  src={iconFilter}
                  className="filter-icon"
                  onClick={() => setFilterDrawerVisible(true)}
                />
              </div>
            </Tooltip>
            <Input.Search
              placeholder="Search salaries"
              enterButton
              onSearch={handleSearch}
              className="search-input"
            />
          </Row>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{
          ...pagination,
          // showTotal: (total) => `Total ${total} items`,
        }}
        loading={isLoading}
        onChange={handleTableChange}
      />
      <Drawer
        title="Filter Salaries"
        width={360}
        onClose={() => setFilterDrawerVisible(false)}
        visible={filterDrawerVisible}
      >
        <Form form={filterForm} layout="vertical" onFinish={handleFilter}>
          <Form.Item name="month" label="Month">
            <Select placeholder="Select a month" allowClear>
              {months.map((month) => (
                <Option key={month} value={month}>
                  {month}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="year" label="Year">
            <Select placeholder="Select a year" allowClear>
              {years.map((year) => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Apply Filters
          </Button>
        </Form>
      </Drawer>
    </>
  );
};

export default SalaryTable;
