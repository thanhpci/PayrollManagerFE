import React, { useState } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { Form, message, Upload, DatePicker, Button, Row, Col, Card, Typography } from 'antd';
import axios from 'axios';

const { Dragger } = Upload;
const { Title } = Typography;

const UploadAttendanceFile = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [month, setMonth] = useState(null);

  const handleUpload = async () => {
    if (!month || fileList.length === 0) {
      message.error('Please select a month and upload at least one file.');
      return;
    }

    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('file', file.originFileObj);
    });
    formData.append('month', month.format('YYYY-MM'));

    setUploading(true);

    try {
      await axios.post('http://localhost:8000/api/upload_attendance/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('Files uploaded successfully');
      setFileList([]);
      setMonth(null);
    } catch (error) {
      message.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const props = {
    name: 'file',
    multiple: true,
    fileList,
    beforeUpload: file => {
      setFileList([...fileList, file]);
      return false; // Prevent automatic upload
    },
    onRemove: file => {
      setFileList(fileList.filter(item => item.uid !== file.uid));
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <Card bordered={false} style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: '20px' }}>Upload Attendance File</Title>
      <Form layout="vertical" onFinish={handleUpload}>
        <Form.Item
          name="month"
          label="Select Month"
          rules={[{ required: true, message: 'Please select a month!' }]}
        >
          <DatePicker
            picker="month"
            style={{ width: '100%' }}
            onChange={value => setMonth(value)}
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
            loading={uploading}
            disabled={fileList.length === 0 || !month}
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
