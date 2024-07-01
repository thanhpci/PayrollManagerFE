import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { PieChartOutlined, TeamOutlined, UploadOutlined, DollarOutlined } from '@ant-design/icons';

import { Layout, Menu, theme } from "antd";
import "./App.css";
import logo from "./assets/logo.png";

import { useLoading } from "./contexts/LoadingContext";
import Loading from "./components/Loading";
import EmployeeListPage from "./pages/EmployeeListPage";
import UploadPage from "./pages/UploadPage";
import SalaryListPage from "./pages/SalaryListPage"
import SalaryDetail from "./components/SalaryDetail";


const { Content, Sider } = Layout;

function getItem(label, key, icon, children, link) {
  return {
    key,
    icon,
    children,
    label: <Link to={link}>{label}</Link>,
  };
}

const items = [
  // getItem("Home", "1", <PieChartOutlined />, null, "/"),
  getItem("Employee List", "2", <TeamOutlined />, null, "/employee-list-page"),
  getItem("Upload File", "3", <UploadOutlined />, null, "/upload-page"),
  getItem("Salary List", "4", <DollarOutlined />, null, "/salary-list-page"),


];

const App = () => {
  const { isLoading } = useLoading();

  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <>
      <Loading isLoading={isLoading} />

      <Router>
        <Layout
          style={{
            minHeight: "100vh",
          }}
        >
          <Sider
            // collapsible
            // collapsed={collapsed}
            // onCollapse={(value) => setCollapsed(value)}
          >
            <div
              className="logo"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "64px",
                margin: "16px",
              }}
            >
              <img
                src={logo}
                alt="Logo"
                style={{ height: "100%", maxWidth: "100%" }}
              />
            </div>
            <Menu
              theme="dark"
              defaultSelectedKeys={["1"]}
              mode="inline"
              items={items}
            />
          </Sider>

          <Layout>
            <Content
              style={{
                margin: "0 16px",
              }}
            >
              <div
                style={{
                  padding: 24,
                  minHeight: 360,
                  background: colorBgContainer,
                  borderRadius: borderRadiusLG,
                }}
              >
                <Routes>
                  <Route path="/" element={<div>Home Page</div>} />
                  <Route path="/employee-list-page" element={<EmployeeListPage />} />
                  <Route path="/upload-page" element={<UploadPage />} />
                  <Route path="/salary-list-page" element={<SalaryListPage />} />
                  <Route path="/salary/:id" element={<SalaryDetail />} />


                </Routes>
              </div>
            </Content>
          </Layout>
        </Layout>
      </Router>
    </>
  );
};

export default App;
