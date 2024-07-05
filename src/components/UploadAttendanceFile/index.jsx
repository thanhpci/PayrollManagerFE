import React, { useState } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { Form, message, Upload, DatePicker, Button, Card, Typography } from 'antd';
import axios from 'axios';
import "./styles.css"
import { useLoading } from "../../contexts/LoadingContext";

const { Dragger } = Upload;
const { Title } = Typography;

const UploadAttendanceFile = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const { isLoading, setIsLoading } = useLoading();
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);

  const handleUpload = async () => {
    if (!month || !year || fileList.length === 0) {
      message.error('Please select a month, year, and upload at least one file.');
      return;
    }

    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('files', file.originFileObj || file);
    });
    formData.append('month', month);
    formData.append('year', year);

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/upload-attendance-file/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success(response.data.message);

      setFileList([]);
      setMonth(null);
      setYear(null);
      form.resetFields();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        message.error(error.response.data.error);
      } else {
        message.error('Upload failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const props = {
    name: 'files',
    multiple: true,
    fileList,
    beforeUpload: file => {
      setFileList(prevList => [...prevList, file]);
      return false;
    },
    onRemove: file => {
      const newFileList = fileList.filter(item => item.uid !== file.uid);
      setFileList(newFileList);
      return true;
    },
  };

  return (
    <Card bordered={true} className="upload-card">
      <Title level={3} className="upload-title">Upload Attendance File</Title>
      <Form form={form} layout="vertical" onFinish={handleUpload}>
        <Form.Item
          name="month"
          label="Select Month"
          rules={[{ required: true, message: 'Please select a month!' }]}
        >
          <DatePicker
            picker="month"
            style={{ width: '100%' }}
            onChange={(date) => {
              setMonth(date.month() + 1);
              setYear(date.year());
            }}
          />
        </Form.Item>
        <Form.Item
          name="upload"
          label="Upload Attendance Files"
          rules={[{ required: true, message: 'Please upload attendance files!' }]}
        >
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned files.
            </p>
          </Dragger>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            disabled={fileList.length === 0 || !month || !year}
            style={{ width: '100%' }}
          >
            Upload
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UploadAttendanceFile;
