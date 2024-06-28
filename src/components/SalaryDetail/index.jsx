import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Descriptions, Table, Card, Alert } from "antd";
import { useLoading } from "../../contexts/LoadingContext";
import "./styles.css";

const SalaryDetail = () => {
  const { id } = useParams();
  const [salaryDetail, setSalaryDetail] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const { isLoading, setIsLoading } = useLoading();
  const [attendanceErrors, setAttendanceErrors] = useState([]);

  useEffect(() => {
    fetchSalaryDetail();
  }, [id]);


  useEffect(() => {
    console.log('attendanceErrors updated:', attendanceErrors);
  }, [attendanceErrors]);

  const fetchSalaryDetail = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:8000/api/salaries/?id=${id}`);
      const salaryData = response.data.results[0];
      setSalaryDetail(salaryData);
      const employee_code = salaryData.employee.employee_code
      const month = salaryData.month
      const year = salaryData.year
      const attendanceResponse = await axios.get(`http://localhost:8000/api/employee-monthly-attendance/?employee_code=${employee_code}&month=${month}&year=${year}`);
      setAttendanceRecords(attendanceResponse.data);

      console.log(salaryData)


      if (salaryData.salary_amount === null) {
        const errorsResponse = await calculateSalary(employee_code, month, year);
        // setAttendanceErrors(errorsResponse.errors);
      }



    } catch (error) {
      console.error("Error fetching salary detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSalary = async (employee_code, month, year) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/calculate-salary/",
        {
          employee_code,
          month,
          year
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
  
      return response.data;
    } catch (error) {
      setAttendanceErrors(error.response.data.errors);

      return error.response.data;
    }
  };
  

  // const attendanceColumns = [
  //   { title: "Date", dataIndex: "date", key: "date", align: "center"},
  //   { title: "Morning Clock In", dataIndex: "morning_clock_in", key: "morning_clock_in", render: (text) => text || "N/A", align: "center"},
  //   { title: "Morning Clock Out", dataIndex: "morning_clock_out", key: "morning_clock_out", render: (text) => text || "N/A", align: "center" },
  //   { title: "Afternoon Clock In", dataIndex: "afternoon_clock_in", key: "afternoon_clock_in", render: (text) => text || "N/A", align: "center" },
  //   { title: "Afternoon Clock Out", dataIndex: "afternoon_clock_out", key: "afternoon_clock_out", render: (text) => text || "N/A", align: "center" },
  // ];



  // const attendanceColumns = [
  //   { title: "Date", dataIndex: "date", key: "date", align: "center" },
  //   { title: "Morning Clock In", dataIndex: "morning_clock_in", key: "morning_clock_in", render: (text, record) => renderErrorText(text, record.date, "morning_clock_in"), align: "center" },
  //   { title: "Morning Clock Out", dataIndex: "morning_clock_out", key: "morning_clock_out", render: (text, record) => renderErrorText(text, record.date, "morning_clock_out"), align: "center" },
  //   { title: "Afternoon Clock In", dataIndex: "afternoon_clock_in", key: "afternoon_clock_in", render: (text, record) => renderErrorText(text, record.date, "afternoon_clock_in"), align: "center" },
  //   { title: "Afternoon Clock Out", dataIndex: "afternoon_clock_out", key: "afternoon_clock_out", render: (text, record) => renderErrorText(text, record.date, "afternoon_clock_out"), align: "center" },
  // ];
  const formatTime = (time) => {
    if (!time) return "N/A";
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}`;
  };
  
  const attendanceColumns = [
    { title: "Date", dataIndex: "date", key: "date", align: "center" },
    { title: "Morning Clock In", dataIndex: "morning_clock_in", key: "morning_clock_in", render: (text, record) => renderErrorText(formatTime(text), record.date, "morning_clock_in"), align: "center" },
    { title: "Morning Clock Out", dataIndex: "morning_clock_out", key: "morning_clock_out", render: (text, record) => renderErrorText(formatTime(text), record.date, "morning_clock_out"), align: "center" },
    { title: "Afternoon Clock In", dataIndex: "afternoon_clock_in", key: "afternoon_clock_in", render: (text, record) => renderErrorText(formatTime(text), record.date, "afternoon_clock_in"), align: "center" },
    { title: "Afternoon Clock Out", dataIndex: "afternoon_clock_out", key: "afternoon_clock_out", render: (text, record) => renderErrorText(formatTime(text), record.date, "afternoon_clock_out"), align: "center" },
  ];

  
  
  const renderErrorText = (text, date, type) => {
    const error = attendanceErrors.find(error => error.date === date && error.errors.some(e => e.error_type === type));
    return error ? <span className="error-highlight">{"Missing time"}</span> : (text || "N/A");
  };
  
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
    </div>
  );
};

export default SalaryDetail;
