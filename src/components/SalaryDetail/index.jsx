import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Descriptions, Table, Card, Drawer, Button, Form, Input, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useLoading } from "../../contexts/LoadingContext";
import "./styles.css";

const SalaryDetail = () => {
  const { id } = useParams();
  const [salaryDetail, setSalaryDetail] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceErrors, setAttendanceErrors] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const { isLoading, setIsLoading } = useLoading();
  const [form] = Form.useForm();

  useEffect(() => {
    init();
  }, [id]);


  useEffect(() => {
    if (salaryDetail && salaryDetail.salary_amount === null) {
      calculateSalary(salaryDetail.employee.employee_code, salaryDetail.month, salaryDetail.year);
    }
  }, [salaryDetail]);

  const init = async () => {
    await fetchSalaryDetail(id);

  };

  const fetchSalaryDetail = async (id) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:8000/api/salaries/?id=${id}`);
      const salaryData = response.data.results[0];
      setSalaryDetail(salaryData);
      await fetchAttendanceRecords(salaryData.employee.employee_code, salaryData.month, salaryData.year);
    } catch (error) {
      console.error("Error fetching salary detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceRecords = async (employee_code, month, year) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/employee-monthly-attendance/?employee_code=${employee_code}&month=${month}&year=${year}`);
      setAttendanceRecords(response.data);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
    }
  };

  const calculateSalary = async (employee_code, month, year) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/calculate-salary/",
        { employee_code, month, year },
        { headers: { "Content-Type": "application/json" } }
      );
      setAttendanceErrors(response.data.errors || []);
    } catch (error) {
      setAttendanceErrors(error.response.data.errors || []);
    }
  };

  const updateAttendanceRecord = async (recordId, updatedFields) => {
    try {
      await axios.patch(`http://localhost:8000/api/attendance_records/${recordId}/`, updatedFields, {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      throw new Error("Failed to update attendance record.");
    }
  };

  const showDrawer = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    form.resetFields();
  };

  const onSave = async () => {
    try {
      const values = await form.validateFields();
      const updatedFields = {};
  
      updatedFields.morning_clock_in = values.morning_clock_in || null;
      updatedFields.morning_clock_out = values.morning_clock_out || null;
      updatedFields.afternoon_clock_in = values.afternoon_clock_in || null;
      updatedFields.afternoon_clock_out = values.afternoon_clock_out || null;
  
      await updateAttendanceRecord(editingRecord.id, updatedFields);
  
      await fetchAttendanceRecords(salaryDetail.employee.employee_code, salaryDetail.month, salaryDetail.year);
      await calculateSalary(salaryDetail.employee.employee_code, salaryDetail.month, salaryDetail.year);
      await fetchSalaryDetail(id);
  
      message.success("Record updated successfully!");
      closeDrawer();
    } catch (error) {
      message.error(error.message);
    }
  };
  

  const formatTime = (time) => {
    if (!time) return "N/A";
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}`;
  };

  const renderErrorText = (text, date, type) => {
    const error = attendanceErrors.find(error => error.date === date && error.errors.some(e => e.error_type === type));
    return error ? <span className="error-highlight">{"Missing time"}</span> : (text || "N/A");
  };

  const attendanceColumns = [
    { title: "Date", dataIndex: "date", key: "date", align: "center" },
    { title: "Morning Clock In", dataIndex: "morning_clock_in", key: "morning_clock_in", render: (text, record) => renderErrorText(formatTime(text), record.date, "morning_clock_in"), align: "center" },
    { title: "Morning Clock Out", dataIndex: "morning_clock_out", key: "morning_clock_out", render: (text, record) => renderErrorText(formatTime(text), record.date, "morning_clock_out"), align: "center" },
    { title: "Afternoon Clock In", dataIndex: "afternoon_clock_in", key: "afternoon_clock_in", render: (text, record) => renderErrorText(formatTime(text), record.date, "afternoon_clock_in"), align: "center" },
    { title: "Afternoon Clock Out", dataIndex: "afternoon_clock_out", key: "afternoon_clock_out", render: (text, record) => renderErrorText(formatTime(text), record.date, "afternoon_clock_out"), align: "center" },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (text, record) => (
        <Button icon={<EditOutlined />} onClick={() => showDrawer(record)} />
      ),
    },
  ];

  if (!salaryDetail) return null;

  return (
    <div className="salary-detail-container">
      <div className="salary-detail-wrapper">
        <h2 className="salary-detail-title">Salary Detail</h2>
        <div className="salary-detail-sections">
          <Descriptions bordered column={1} className="salary-detail-descriptions">
            <Descriptions.Item label="Employee Code" className="description-item">{salaryDetail.employee.employee_code}</Descriptions.Item>
            <Descriptions.Item label="Name" className="description-item">{salaryDetail.employee.name}</Descriptions.Item>
            <Descriptions.Item label="Month" className="description-item">{salaryDetail.month}</Descriptions.Item>
            <Descriptions.Item label="Year" className="description-item">{salaryDetail.year}</Descriptions.Item>
            <Descriptions.Item label="Basic Days After Holidays" className="description-item">{salaryDetail.basic_days_after_holidays}</Descriptions.Item>
            <Descriptions.Item label="Basic Hours After Holidays" className="description-item">{salaryDetail.basic_hours_after_holidays}</Descriptions.Item>
            <Descriptions.Item label="Actual Work Hours" className="description-item">{salaryDetail.actual_work_hours}</Descriptions.Item>
            <Descriptions.Item label="Worked Days" className="description-item">{salaryDetail.worked_days}</Descriptions.Item>
            <Descriptions.Item label="Penalty Hours" className="description-item">{salaryDetail.penalty_hours}</Descriptions.Item>
          </Descriptions>
          <Descriptions bordered column={1} className="salary-detail-descriptions">
            <Descriptions.Item label="Worked Day Off Days" className="description-item">{salaryDetail.worked_day_off_days}</Descriptions.Item>
            <Descriptions.Item label="Sunday Hours" className="description-item">{salaryDetail.sunday_hours}</Descriptions.Item>
            <Descriptions.Item label="Holiday Hours" className="description-item">{salaryDetail.holiday_hours}</Descriptions.Item>
            <Descriptions.Item label="Worked Holiday Hours" className="description-item">{salaryDetail.worked_holiday_hours}</Descriptions.Item>
            <Descriptions.Item label="Average Hours Per Day" className="description-item">{salaryDetail.average_hours_per_day}</Descriptions.Item>
            <Descriptions.Item label="Worked Day Off Hours" className="description-item">{salaryDetail.worked_day_off_hours}</Descriptions.Item>
            <Descriptions.Item label="Overtime Hours" className="description-item">{salaryDetail.overtime_hours}</Descriptions.Item>
            <Descriptions.Item label="Total Hours" className="description-item">{salaryDetail.total_hours}</Descriptions.Item>
            <Descriptions.Item label="Salary" className="description-item">{salaryDetail.salary_amount}</Descriptions.Item>
          </Descriptions>
        </div>
      </div>
      <Card title={<h2 className="attendance-records-title">Attendance Records</h2>} className="attendance-records-card">
        <Table
          dataSource={attendanceRecords}
          columns={attendanceColumns}
          rowKey="id"
          pagination={false}
          className="attendance-table"
        />
      </Card>      
      <Drawer
        title="Edit Attendance Record"
        width={720}
        onClose={closeDrawer}
        visible={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Form form={form} layout="vertical" initialValues={editingRecord}>
          <Form.Item name="date" label="Date">
            <span>{editingRecord?.date}</span>
          </Form.Item>
          <Form.Item name="morning_clock_in" label="Morning Clock In">
            <Input />
          </Form.Item>
          <Form.Item name="morning_clock_out" label="Morning Clock Out">
            <Input />
          </Form.Item>
          <Form.Item name="afternoon_clock_in" label="Afternoon Clock In">
            <Input />
          </Form.Item>
          <Form.Item name="afternoon_clock_out" label="Afternoon Clock Out">
            <Input />
          </Form.Item>
        </Form>
        <div
          style={{
            textAlign: "right",
          }}
        >
          <Button onClick={closeDrawer} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button onClick={onSave} type="primary">
            Save
          </Button>
        </div>
      </Drawer>
    </div>
  );
};

export default SalaryDetail;
